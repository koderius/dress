import {Injectable} from '@angular/core';
import {ICreateOrderRequest, IPayPalConfig} from 'ngx-paypal';
import {Dress} from '../models/Dress';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import {UserDataService} from './user-data.service';
import {RentService} from './rent.service';
import {CountryPipe} from '../pipes/country.pipe';
import {AppIdentifier, PaypalClient} from '../../../functions/src/keys';

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

  constructor(
    private userService: UserDataService,
    private rentService: RentService,
  ) {}

  init() {
    this.metadataRef.onSnapshot(snapshot => {
      this.metadata = snapshot.data() as PaymentMetadata;
    });
  }

  get payer() {
    return this.userService.currentUser;
  }

  // Calc the deposit according to the price and the payment metadata
  calcDeposit(price: number) : number {
    const steps = Object.keys(this.metadata.deposit);
    const step = steps.find((step) => +step >= price) || 'high';
    return price * this.metadata.deposit[step];
  }


  async cratePayment(dress: Dress) : Promise<IPayPalConfig> {

    // Make sure deposit is updated
    dress.deposit = this.calcDeposit(dress.price);

    // User name
    const names = this.payer.fullName.split(' ').map((n)=>n.trim()).filter((v)=>v);

    const refId: string = [
      AppIdentifier,
      dress.id,
      this.payer.uid
    ].join('_');

    return {
      clientId: PaypalClient,
      currency: 'USD',
      createOrderOnClient: data => <ICreateOrderRequest> {

        // Payer default details => user details
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

        // Purchase details
        purchase_units: [{

          // Dress and payer details
          reference_id: refId,
          // Rent ID
          custom_id: this.rentService.getNewRefId(),

          // Total price = 85% dress price + deposit + 15% dress price as handling fee
          amount: {
            currency_code: 'USD',
            value: (dress.price + dress.deposit).toString(),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: ((dress.price * (1 - this.metadata.handling)) + dress.deposit).toString(),
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
    }

  }

}
