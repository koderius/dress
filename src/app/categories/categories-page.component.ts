import { Component } from '@angular/core';
import {CategoriesService} from '../services/categories.service';
import {SearchFiltersRaw} from '../models/SearchFilters';
import {NavigationService} from '../services/navigation.service';

@Component({
  selector: 'app-categories',
  templateUrl: 'categories-page.component.html',
  styleUrls: ['categories-page.component.scss']
})
export class CategoriesPage {

  constructor(
    public categoryService: CategoriesService,
    private navService: NavigationService,
  ) {}

  /** Go to home page and filter dresses by the selected category */
  filterByCategory(categoryId: string) {
    const filter: SearchFiltersRaw = {category: categoryId};
    this.navService.search(filter);
  }

}
