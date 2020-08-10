import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserDataService} from '../services/user-data.service';
import {UserDoc} from '../models/User';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {NavController} from '@ionic/angular';
import {Dress} from '../models/Dress';
import {PurchaseService} from './purchase.service';
import {NavigationService} from '../services/navigation.service';
import {PhotoPopoverCtrlService} from '../components/photo-popover/photo-popover-ctrl.service';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.page.html',
  styleUrls: ['./purchase.page.scss'],
})
export class PurchasePage implements OnInit {

  COIN_SIGN = '$';

  step$: Observable<number>;

  shipping: UserDoc;

  dress: Dress;

  owner: UserDoc;

  shippingPrice: number = 0;

  constructor(
    private userService: UserDataService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private navService: NavigationService,
    private purchaseService: PurchaseService,
    private photoPopover: PhotoPopoverCtrlService,
  ) {
    // Step observable according to URL parameter
    this.step$ = this.activatedRoute.params.pipe(map((params) => +params['step']));
  }

  private navToStep(step: number) {
    this.navCtrl.navigateForward(['../' + step], {relativeTo: this.activatedRoute});
  }

  ngOnInit() {
    // Get the dress to rent
    this.dress = this.purchaseService.dressToRent;
    this.owner = this.purchaseService.owner;
    // Set default shipping address according to user's properties
    this.shipping = this.userService.currentUser;
  }

  confirmStep1() {
    if(this.purchaseService.setShippingAddress(this.shipping))
      this.navToStep(2);
  }

  confirmStep2() {
    if(this.purchaseService.setOrder())
      this.navToStep(3);
  }

  goToRenter() {
    this.navService.renterView(this.owner.uid);
  }

  openPhotos() {
    this.photoPopover.showPhoto(this.dress.photos);
  }

}
