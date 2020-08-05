import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {DressesService} from '../services/dresses.service';
import {Dress} from '../models/Dress';
import {Platform, ToastController} from '@ionic/angular';
import {AuthService, UserDoc} from '../services/auth.service';
import {CategoriesService} from '../services/categories.service';
import {PhotoPopoverCtrlService} from '../components/photo-popover/photo-popover-ctrl.service';
import {NavigationService} from '../services/navigation.service';
import {FeedBack} from '../models/Feedback';
import {FeedBacksService} from '../services/feed-backs.service';

@Component({
  selector: 'app-dress-view',
  templateUrl: './dress-view.page.html',
  styleUrls: ['./dress-view.page.scss'],
})
export class DressViewPage implements OnInit, OnDestroy {

  COIN_SIGN = '$';

  paramsSub: Subscription;
  dress: Dress;
  dressOwner: UserDoc;
  feedBacks: FeedBack[];

  photos: string[] = [];

  sliderOptions = {
    loop: true,
  };

  // Preview mode
  isMine: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dressService: DressesService,
    private platform: Platform,
    private authService: AuthService,
    private categoriesService: CategoriesService,
    public photoPopover: PhotoPopoverCtrlService,
    private navService: NavigationService,
    private feedBacksService: FeedBacksService,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {

    // Load dress according to URL ID parameter
    this.paramsSub = this.activatedRoute.params.subscribe(async (params)=>{

      const id = params['id'];
      this.dress = await this.dressService.loadDress(id);
      this.isMine = this.dress.owner == this.authService.currentUser.uid;
      this.dressOwner = await this.authService.getUserDoc(this.dress.owner);
      this.feedBacks = await this.feedBacksService.getUserFeedBacks(this.dressOwner.uid);

      // Move main photo the the beginning
      this.photos = this.dress.photos;
      const mainPhoto = this.photos.splice(this.dress.mainPhoto,1);
      this.photos.unshift(...mainPhoto);

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
    if(this.isMine && !await this.toastCtrl.getTop()) {
      const t = await this.toastCtrl.create({
        header: 'Preview mode!',
        position: 'middle',
        duration: 500,
        color: 'medium',
        cssClass: 'ion-text-center'
      });
      t.present();
    }
    else {
      if(value == 'contact') {
        // TODO
      }
      if(value == 'rent') {
        // TODO
      }
    }

    // Reset segment (to allow clicking on the same button again)
    event.target['value'] = null;

  }

}
