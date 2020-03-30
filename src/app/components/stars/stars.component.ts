import {Component, Input, OnInit} from '@angular/core';
import {RankCalc} from '../../Utils/RankCalc';

@Component({
  selector: 'app-stars',
  templateUrl: './stars.component.html',
  styleUrls: ['./stars.component.scss'],
})
export class StarsComponent implements OnInit {

  readonly starImg = '../../assets/images/star.png';
  readonly emptyStarImg = '../../assets/images/star_empty.png';

  @Input() rank: number[];
  @Input() size: string = '1.5em';

  roundedRank: number;

  stars = [1,2,3,4,5];

  constructor() { }

  ngOnInit() {
    this.roundedRank = RankCalc.AverageRank(this.rank);
  }

}
