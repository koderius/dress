import {Component, Input, OnInit} from '@angular/core';
import {FeedBack} from '../../models/Feedback';
import {NavigationService} from '../../services/navigation.service';

@Component({
  selector: 'app-feed-backs-list',
  templateUrl: './feed-backs-list.component.html',
  styleUrls: ['./feed-backs-list.component.scss'],
})
export class feedBacksListComponent implements OnInit {

  @Input() feedBacks: FeedBack[] = [{
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

  private _extended: boolean;
  get extended() {
    return this._extended;
  }
  set extended(toggle: boolean) {
    this.list = toggle ? this.feedBacks : this.feedBacks.slice(0, this.minShow);
    this._extended = toggle;
  }

  list: FeedBack[];

  constructor(
    private navService: NavigationService,
  ) {
    this.extended = false;
  }

  ngOnInit() {
  }

  goToUser(uid: string) {
    this.navService.renterView(uid);
  }

}
