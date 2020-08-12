import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {DressesService} from '../services/dresses.service';
import {Dress} from '../models/Dress';
import {Platform, ToastController} from '@ionic/angular';
import {CategoriesService} from '../services/categories.service';
import {PhotoPopoverCtrlService} from '../components/photo-popover/photo-popover-ctrl.service';
import {NavigationService} from '../services/navigation.service';
import {FeedBack} from '../models/Feedback';
import {FeedBacksService} from '../services/feed-backs.service';
import {ChatOpenerService} from '../chat-modal/chat-opener.service';
import {UserDataService} from '../services/user-data.service';
import {UserDoc} from '../models/User';
import {PurchaseService} from '../purchase/purchase.service';
import {DefaultUserImage} from '../Utils/Images';
import {CountriesUtil} from '../Utils/CountriesUtil';

@Component({
  selector: 'app-dress-view',
  templateUrl: './dress-view.page.html',
  styleUrls: ['./dress-view.page.scss'],
})
export class DressViewPage implements OnInit, OnDestroy {

  DefaultUserImage = DefaultUserImage;

  paramsSub: Subscription;
  dress: Dress;
  dressOwner: UserDoc;
  feedBacks: FeedBack[];

  photos: string[] = [];
  ownerCountry: CountriesUtil;

  sliderOptions = {
    loop: true,
  };

  // Preview mode
  isMine: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dressService: DressesService,
    private platform: Platform,
    private userData: UserDataService,
    private categoriesService: CategoriesService,
    public photoPopover: PhotoPopoverCtrlService,
    private navService: NavigationService,
    private feedBacksService: FeedBacksService,
    private toastCtrl: ToastController,
    private chatOpener: ChatOpenerService,
    private purchaseService: PurchaseService,
  ) { }

  ngOnInit() {

    // Load dress according to URL ID parameter
    this.paramsSub = this.activatedRoute.params.subscribe(async (params)=>{

      const id = params['id'];
      this.dress = await this.dressService.loadDress(id);
      this.isMine = this.dress.owner == this.userData.currentUser.uid;
      this.dressOwner = await this.userData.getUserDoc(this.dress.owner);
      this.feedBacks = await this.feedBacksService.getFeedBacks(this.dressOwner.uid);

      // Move main photo the the beginning
      this.photos = this.dress.photos;
      const mainPhoto = this.photos.splice(this.dress.mainPhoto,1);
      this.photos.unshift(...mainPhoto);

      this.ownerCountry = new CountriesUtil(this.dressOwner.country);

    });

  }

  ngOnDestroy(): void {
    this.paramsSub.unsubscribe();
  }

  getCategory(id: string) {
    return this.categoriesService.getCategoryById(id);
  }

  goToRenter() {
    this.navService.renterView(this.dressOwner.uid);
  }


  async segmentClicked(event: CustomEvent) {

    // Prevent emit on mouse leave (some segment's stupid problems)
    const value: 'contact' | 'rent' = event.detail.value;
    if(!value)
      return;

    // If on preview mode
    if(this.isMine) {
      if(!await this.toastCtrl.getTop()) {
        const t = await this.toastCtrl.create({
          header: 'Preview mode!',
          position: 'middle',
          duration: 500,
          color: 'medium',
          cssClass: 'ion-text-center'
        });
        t.present();
      }
    }
    else {
      if(value == 'contact') {
        this.chatOpener.openChat(this.dressOwner.uid, this.dress);
      }
      if(value == 'rent') {
        this.purchaseService.startPurchaseProcess(this.dress.id);
      }
    }

    // Reset segment (to allow clicking on the same button again)
    event.target['value'] = null;

  }

}
