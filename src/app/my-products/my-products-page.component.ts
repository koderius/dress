import {Component, OnInit} from '@angular/core';
import {Dress, DressStatus} from '../models/Dress';

@Component({
  selector: 'app-uploads',
  templateUrl: './my-products-page.component.html',
  styleUrls: ['./my-products-page.component.scss'],
})
export class MyProductsPage implements OnInit {

  DressStatus = DressStatus;

  myDresses: Dress[] = [
    new Dress({
      name: 'Lorem Ipsum',
      status: DressStatus.OPEN,
    }),
    new Dress({
      name: 'Lorem Ipsum',
      status: DressStatus.RENTED,
    }),
    new Dress({
      name: 'Lorem Ipsum',
      status: DressStatus.OPEN,
    })
  ];

  constructor() { }

  ngOnInit() {
  }

}
