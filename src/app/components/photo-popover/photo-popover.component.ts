import {Component, Input, OnInit} from '@angular/core';
import {PopoverController} from '@ionic/angular';

@Component({
  selector: 'app-photo-popover',
  templateUrl: './photo-popover.component.html',
  styleUrls: ['./photo-popover.component.scss'],
})
export class PhotoPopoverComponent implements OnInit {

  @Input() images: string | string[];

  isArray: boolean;
  imgList: string[] = [];
  idx: number = 0;

  constructor(public popoverCtrl: PopoverController) {}

  ngOnInit() {
    this.isArray = Array.isArray(this.images);
    if(this.isArray)
      this.imgList = [...this.images];
    else
      this.imgList = [this.images as string];
  }

  back() {
    this.idx--;
    if(this.idx < 0)
      this.idx = this.imgList.length - 1;
  }

  forward() {
    this.idx++;
    if(this.idx >= this.imgList.length)
      this.idx = 0;
  }

}
