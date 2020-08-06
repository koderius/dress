import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Dress} from '../../models/Dress';
import {CategoriesService} from '../../services/categories.service';
import {NavigationService} from '../../services/navigation.service';

@Component({
  selector: 'app-dress-card',
  templateUrl: './dress-card.component.html',
  styleUrls: ['./dress-card.component.scss'],
})
export class DressCardComponent implements OnInit {

  @Input() dress: Dress;
  @Output() checkClicked = new EventEmitter<void>();

  constructor(
    private dressCategories: CategoriesService,
    private navService: NavigationService
  ) {}

  ngOnInit() {
  }

  getCategoryName() {
    const c = this.dressCategories.allCategories.find((c)=>c.id == this.dress.category);
    return c ? c.title : '';
  }

  viewDress() {
    this.checkClicked.emit();
    this.navService.dressView(this.dress.id);
  }


}
