import { Component } from '@angular/core';
import {CategoriesService} from '../services/categories.service';
import {SearchFilters} from '../models/SearchFilters';
import {NavigationService} from '../services/navigation.service';

@Component({
  selector: 'app-categories',
  templateUrl: 'categories-page.component.html',
  styleUrls: ['categories-page.component.scss']
})
export class CategoriesPage {

  constructor(
    private categoryService: CategoriesService,
    private navService: NavigationService,
  ) {}

  categories() {
    return this.categoryService.allCategories;
  }

  /** Go to home page and filter dresses by the selected category */
  filterByCategory(categoryId: string) {
    const filter = new SearchFilters();
    filter.categories = [categoryId];
    this.navService.home(filter.toRaw());
  }

}
