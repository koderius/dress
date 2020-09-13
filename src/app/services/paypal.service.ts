import {EventEmitter, Injectable} from '@angular/core';
import {ICreateOrderRequest, IPayPalConfig} from 'ngx-paypal';
import {Dress} from '../models/Dress';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import {UserDataService} from './user-data.service';
import {RentService} from './rent.service';
import {CountryPipe} from '../pipes/country.pipe';

type PaymentMetadata = {
  handling: number,
  deposit: { [upTo: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class PaypalService {

  private readonly metadataRef = firebase.firestore().collection('app').doc('payments');

  private metadata: PaymentMetadata;
  get depositData() {
    return {...this.metadata.deposit};
  }

  onPaymentAuthorized = new EventEmitter();

  constructor(
    private userService: UserDataService,
    private rentService: RentService,
  ) {}

  get payer() {
    return this.userService.currentUser;
  }

  // Calc the deposit according to the price and the payment metadata
  calcDeposit(price: number) : number {
    const steps = Object.keys(this.metadata.deposit);
    const step = steps.find((step) => +step >= price) || 'high';
    return price * this.metadata.deposit[step];
  }


  async paypalInit(dress: Dress) : Promise<IPayPalConfig> {

    // Load payment metadata
    this.metadata = (await this.metadataRef.get()).data() as PaymentMetadata;

    // Make sure deposit is updated
    dress.deposit = this.calcDeposit(dress.price);

    // User name
    const names = this.payer.fullName.split(' ').map((n)=>n.trim()).filter((v)=>v);

    return {
      clientId: 'AZZLGDyUK3qag64YzcX18WYTIuywQkJGWFsGDpDSR8NQz5CifH81SfuthYuad4SEROhJsDMuEG6Xwdan',
      currency: 'USD',
      createOrderOnClient: data => <ICreateOrderRequest> {
        payer: {
          name: {
            given_name: names[0] || '',
            surname: names[1] || '',
          },
          email_address: this.payer.email,
          address: {
            country_code: this.payer.country || CountryPipe.GetLocaleCountryCode(),
            admin_area_1: this.payer.state || '',
            admin_area_2: this.payer.city || '',
            address_line_1: this.payer.address || '',
            postal_code: this.payer.zipCode || '',
          }
        },
        purchase_units: [{
          reference_id: dress.id + '_' + this.payer.uid,
          custom_id: this.rentService.getNewRefId(),
          amount: {
            currency_code: 'USD',
            value: (dress.price + dress.deposit).toString(),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: ((dress.price * 0.85) + dress.deposit).toString(),
              },
              handling: {
                currency_code: 'USD',
                value: (dress.price * this.metadata.handling).toString(),
              }
            }
          },
          items: [
            {
              name: dress.name,
              quantity: '1',
              category: 'PHYSICAL_GOODS',
              unit_amount: {
                currency_code: 'USD',
                value: (dress.price * (1 - this.metadata.handling)).toString(),
              },
            },
            {
              name: 'Deposit',
              quantity: '1',
              category: 'DIGITAL_GOODS',
              unit_amount: {
                currency_code: 'USD',
                value: dress.deposit.toString(),
              }
            }
          ],
        }],
      },
      onClientAuthorization: async (data) => {
        console.log(data);
        this.onPaymentAuthorized.emit();
      }
    }

  }

}
