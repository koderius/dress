import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Dress} from '../models/Dress';
import {UserDoc} from '../models/User';
import {DressesService} from '../services/dresses.service';
import {UserDataService} from '../services/user-data.service';
import {FeedBacksService} from '../services/feed-backs.service';
import {RentService} from '../services/rent.service';
import {NavigationService} from '../services/navigation.service';
import {Subscription} from 'rxjs';
import {FeedBack} from '../models/Feedback';
import {CloudFunctions} from '../../FirebaseCloudFunctions';
import {AlertsService} from '../services/Alerts.service';
import {DefaultUserImage} from '../Utils/Images';

@Component({
  selector: 'app-dress-feedback',
  templateUrl: './dress-feedback-page.component.html',
  styleUrls: ['./dress-feedback-page.component.scss'],
})
export class DressFeedbackPage implements OnInit, OnDestroy {

  DefaultUserImage = DefaultUserImage;

  urlSub: Subscription;

  dress: Dress;
  owner: UserDoc;
  renter: UserDoc;

  feedbacks: {
    feedback: FeedBack,
    exists: boolean,
    nameText: string;
    dressOrUser: Dress | UserDoc,
  }[] = [];

  otherComment: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private rentsService: RentService,
    private dressesService: DressesService,
    private userService: UserDataService,
    public navService: NavigationService,
    private feedBacksService: FeedBacksService,
    private alertsService: AlertsService,
  ) { }

  ngOnInit() {

    // Get the rent ID from the URL
    this.urlSub = this.activatedRoute.params.subscribe(async params => {

      const id = params['id'];
      const rent = await this.rentsService.getRentDoc(id);

      // Make sure the rent doc exits and permitted for this user
      if(!rent) {
        this.navService.back();
        return;
      }

      // Load the dress and the owner data, or the renter data (for the owner feedback)
      if(rent.renterId == this.userService.currentUser.uid) {
        this.dress = await this.dressesService.loadDress(rent.dressId);
        this.owner = await this.userService.getUserDoc(rent.ownerId);
      }
      else if(rent.ownerId == this.userService.currentUser.uid)
        this.renter = await this.userService.getUserDoc(rent.renterId);

      // Load the feedbacks that the renter already wrote about this dress
      if(rent.renterId == this.userService.currentUser.uid) {
        const myDressFeedBack = await this.feedBacksService.getMyFeedBack('dress', this.dress.id);
        this.feedbacks.push({
          feedback: myDressFeedBack,
          exists: !!Object.keys(myDressFeedBack).length,
          nameText: 'dress',
          dressOrUser: this.dress,
        });
      }

      // Load the other user (owner/renter) feedback
      const myUserFeedBack = await this.feedBacksService.getMyFeedBack('user', (this.owner || this.renter).uid);
      this.feedbacks.push({
        feedback: myUserFeedBack,
        exists: !!Object.keys(myUserFeedBack).length,
        nameText: this.owner ? 'owner' : 'renter',
        dressOrUser: this.owner || this.renter,
      });

    });
  }

  ngOnDestroy() {
    this.urlSub.unsubscribe();
  }

  // Navigate to dress/user page
  goTo(dressOrUser: Dress | UserDoc) {
    if (dressOrUser instanceof Dress)
      this.navService.dressView(dressOrUser.id);
    else
      this.navService.renterView(dressOrUser.uid);
  }

  /**
   * Send the feedbacks to both dress and its owner.
   * Send also an email to the support if the user mentioned an additional comment.
   * Return true when all done
   */
  async sendFeedback() {
    // Send both feedbacks
    const promises: Promise<boolean>[] = this.feedbacks.map(feedbackUI => {
      if(feedbackUI.dressOrUser instanceof Dress)
        return this.feedBacksService.writeFeedBack(feedbackUI.dressOrUser.id, feedbackUI.feedback, 'dress');
      else
        return this.feedBacksService.writeFeedBack(feedbackUI.dressOrUser.uid, feedbackUI.feedback, 'user');
    });
    // Send email with additional comment
    if(this.otherComment) {
      const user = this.userService.currentUser;
      promises.push(CloudFunctions.reportToSupport({
        subject: 'User comment on feedback',
        text: `The user ${user.fullName} (ID: ${user.uid}, email: ${user.email})
        has left a comment about his rent experience with
        ${this.owner.fullName} (ID: ${this.owner.uid}, email: ${this.owner.email}).
        Dress: "${this.dress.name}" (ID: ${this.dress.id}).
        Comment:
        ${this.otherComment}`
      }));
    }
    this.alertsService.showLoader('Publishing...');
    await Promise.all(promises);
    this.alertsService.dismissLoader();
    await this.alertsService.notice('The review has been published', 'Thanks for your review!');
    this.navService.back();
  }

}
