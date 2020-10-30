import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserDataService} from '../services/user-data.service';
import {UserDoc} from '../models/User';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {NavController} from '@ionic/angular';
import {Dress} from '../models/Dress';
import {PurchaseService} from './purchase.service';
import {NavigationService} from '../services/navigation.service';
import {PhotoPopoverCtrlService} from '../components/photo-popover/photo-popover-ctrl.service';
import {DefaultUserImage} from '../Utils/Images';
import {AlertsService} from '../services/Alerts.service';
import {IPayPalConfig} from 'ngx-paypal';
import {PaypalService} from '../services/paypal.service';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.page.html',
  styleUrls: ['./purchase.page.scss'],
})
export class PurchasePage implements OnInit {

  DefaultUserImage = DefaultUserImage;

  step$: Observable<number>;

  dress: Dress;

  owner: UserDoc;

  shippingPrice: number = 0;

  paypalConfig: IPayPalConfig;


  constructor(
    private userService: UserDataService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private navService: NavigationService,
    private purchaseService: PurchaseService,
    private photoPopover: PhotoPopoverCtrlService,
    private alertsService: AlertsService,
    private paypalService: PaypalService,
  ) {
    // Step observable according to URL parameter
    this.step$ = this.activatedRoute.params.pipe(map((params) => +params['step']));
  }

  private async navToStep(step: number) {
    await this.navCtrl.navigateForward('tabs/purchase/' + step);
  }

  async ngOnInit() {
    // Get the dress to rent and its owner data
    this.dress = this.purchaseService.dressToRent;
    this.owner = this.purchaseService.owner;
    // Set the PayPal buttons configurations
    this.paypalConfig = await this.paypalService.cratePayment(this.dress);
    // Listen to payment authorization
    this.paypalConfig.onApprove = ((data, actions) => {
      console.log(data, actions);
      this.alertsService.showLoader('Authorizing...');
    });
    this.paypalConfig.onError = (err => {
      console.error(err);
      this.alertsService.dismissLoader();
    });
    this.paypalConfig.onClientAuthorization = async () => {
      this.alertsService.dismissLoader();
      await this.alertsService.notice('Payment authorized!');
      this.navService.home();
    };
  }

  confirmStep1() {
    this.navToStep(2);
  }

  goToRenter() {
    this.navService.renterView(this.owner.uid);
  }

  openPhotos() {
    this.photoPopover.showPhoto(this.dress.photos);
  }

}
