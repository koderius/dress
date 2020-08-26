import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {RankCalc} from '../../Utils/RankCalc';

@Component({
  selector: 'app-stars',
  templateUrl: './stars.component.html',
  styleUrls: ['./stars.component.scss'],
})
export class StarsComponent implements OnInit {

  readonly starImg = '../../assets/images/star.png';
  readonly emptyStarImg = '../../assets/images/star_empty.png';

  @Input() rank: number | number[];
  @Input() size: string = '1.5em';
  @Input() selectable: boolean;
  @Output() selected = new EventEmitter<number>();

  roundedRank: number;

  stars = [1,2,3,4,5];

  constructor() { }

  ngOnInit() {
    if(typeof this.rank == 'number')
      this.roundedRank = Math.round(this.rank);
    else
      this.roundedRank = RankCalc.AverageRank(this.rank);
  }

  starClicked(rank: number) {
    if(this.selectable) {
      this.roundedRank = rank;
      this.selected.emit(rank);
    }
  }

}
