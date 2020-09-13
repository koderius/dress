import {Component, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FeedBack} from '../../models/Feedback';
import {NavigationService} from '../../services/navigation.service';
import {FeedBacksService} from '../../services/feed-backs.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-feed-backs-list',
  templateUrl: './feed-backs-list.component.html',
  styleUrls: ['./feed-backs-list.component.scss'],
})
export class feedBacksListComponent implements OnInit, OnDestroy {

  @Input() listTitle: string;

  @Input() id: string;
  @Input() dressOrUser: 'dress' | 'user';

  fbSub: Subscription;

  feedBacks: FeedBack[] = [];

  @Input() showMax: number = 2;

  canExtend: boolean;

  constructor(
    private navService: NavigationService,
    private feedBackService: FeedBacksService,
  ) {}

  ngOnInit() {
    if(!this.dressOrUser)
      throw Error('Must mention feedbacks type');
    // Load the requested amount with 1 extra, in order to know whether there are more
    this.fbSub = this.feedBackService.feedBacks$(this.dressOrUser, this.id, this.showMax + 1).subscribe((feedbacks)=>{
      this.feedBacks = feedbacks;
      // If there are more, it's possible to extend
      this.canExtend = !!this.feedBacks.splice(this.showMax).length;
    });
  }

  ngOnDestroy() {
    this.fbSub.unsubscribe();
  }

  // Load all
  extend() {
    this.fbSub.unsubscribe();
    this.fbSub = this.feedBackService.feedBacks$(this.dressOrUser, this.id).subscribe((feedbacks)=>{
      this.feedBacks = feedbacks;
    });
    this.canExtend = false;
  }

  goToUser(uid: string) {
    this.navService.renterView(uid);
  }

}
