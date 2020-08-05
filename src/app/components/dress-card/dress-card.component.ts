import {Component, Input, OnInit} from '@angular/core';
import {Dress} from '../../models/Dress';
import {CategoriesService} from '../../services/categories.service';

@Component({
  selector: 'app-dress-card',
  templateUrl: './dress-card.component.html',
  styleUrls: ['./dress-card.component.scss'],
})
export class DressCardComponent implements OnInit {

  @Input() dress: Dress;

  constructor(
    private dressCategories: CategoriesService,
  ) {}

  ngOnInit() {
  }

  getCategoryName() {
    const c = this.dressCategories.allCategories.find((c)=>c.id == this.dress.category);
    return c ? c.title : '';
  }


}
