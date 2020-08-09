import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {RankCalc} from '../Utils/RankCalc';
import {NavigationService} from '../services/navigation.service';
import {PhotoPopoverCtrlService} from '../components/photo-popover/photo-popover-ctrl.service';
import {FeedBacksService} from '../services/feed-backs.service';
import {FeedBack} from '../models/Feedback';
import {Subscription} from 'rxjs';
import {AlertsService} from '../services/Alerts.service';
import {DressesService} from '../services/dresses.service';
import {Dress} from '../models/Dress';
import {ChatOpenerService} from '../chat-modal/chat-opener.service';
import {UserDataService} from '../services/user-data.service';
import {UserDoc} from '../models/User';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './renter-profile-page.component.html',
  styleUrls: ['./renter-profile-page.component.scss'],
})
export class RenterProfilePage implements OnInit, OnDestroy {

  userSub: Subscription;

  RankCalc = RankCalc;

  userDoc: UserDoc;

  userDresses: Dress[] = [];

  feedBacks: FeedBack[];

  myFeedBack: FeedBack = {};

  constructor(
    private userService: UserDataService,
    private activatedRoute: ActivatedRoute,
    private navService: NavigationService,
    public photoPopover: PhotoPopoverCtrlService,
    private feedBackService: FeedBacksService,
    private alertService: AlertsService,
    private dressService: DressesService,
    private chatOpener: ChatOpenerService,
  ) {}

  ngOnInit() {

    // Get user document according to url, and then get his feed backs & some dresses
    this.userSub = this.activatedRoute.params.subscribe(async (params)=>{
      this.userDoc = await this.userService.getUserDoc(params['uid']);
      this.feedBacks = await this.feedBackService.getUserFeedBacks(this.userDoc.uid);
      this.userDresses = await this.dressService.loadDressesOfUser(this.userDoc.uid, 4);
    });

  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  isSignedIn() : boolean {
    return !!this.userService.currentUser;
  }

  isMe() : boolean {
    return this.userDoc.uid == this.userService.currentUser.uid;
  }

  goToEdit() {
    this.navService.profile();
  }

  sendFeedBack() {
    if(!this.myFeedBack.rank) {
      this.alertService.notice('Please rank the dress (1-5) using the stars icons', 'Missed something...');
      return;
    }
    this.feedBackService.writeUserFeedBack(this.userDoc.uid, this.myFeedBack);
  }

  connectRenter() {
    this.chatOpener.openChat(this.userDoc.uid);
  }

}
