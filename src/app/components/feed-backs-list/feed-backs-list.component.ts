import {Component, Input, OnInit} from '@angular/core';
import {FeedBack} from '../../models/Feedback';
import {NavigationService} from '../../services/navigation.service';
import {FeedBacksService} from '../../services/feed-backs.service';

@Component({
  selector: 'app-feed-backs-list',
  templateUrl: './feed-backs-list.component.html',
  styleUrls: ['./feed-backs-list.component.scss'],
})
export class feedBacksListComponent implements OnInit {

  @Input() listTitle: string;

  @Input() uid: string;

  feedBacks: FeedBack[] = [{
    writerId: 'ahsdjkf',
    writerName: 'Somebody I know',
    timestamp: 12334123412,
    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took',
    title: 'The dress is sucks',
  },
    {
      writerId: 'ahsdjkf',
      writerName: 'Somebody I know',
      timestamp: 12334123412,
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took',
      title: 'The dress is sucks',
    },
    {
      writerId: 'ahsdjkf',
      writerName: 'Somebody I know',
      timestamp: 12334123412,
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took',
      title: 'The dress is sucks',
    },
    {
      writerId: 'ahsdjkf',
      writerName: 'Somebody I know',
      timestamp: 12334123412,
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took',
      title: 'The dress is sucks',
    }
  ];

  @Input() minShow: number = 2;

  canExtend: boolean;

  constructor(
    private navService: NavigationService,
    private feedBackService: FeedBacksService,
  ) {}

  async ngOnInit() {
    // Load the requested amount with 1 extra, in order to know whether there are more
    this.feedBacks = await this.feedBackService.getUserFeedBacks(this.uid, this.minShow + 1);
    // If there are more, it's possible to extend
    this.canExtend = !!this.feedBacks.splice(this.minShow).length;
  }

  // Load all
  async extend() {
    this.feedBacks = await this.feedBackService.getUserFeedBacks(this.uid);
    this.canExtend = false;
  }

  goToUser(uid: string) {
    this.navService.renterView(uid);
  }

}
