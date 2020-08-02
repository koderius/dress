import { Component } from '@angular/core';
import {DressCategory} from '../models/Dress';
import {CategoriesService} from '../services/categories.service';
import {ScreenSizeUtil} from '../Utils/ScreenSizeUtil';
import {SearchFiltersRaw} from '../models/SearchFilters';
import {NavigationService} from '../services/navigation.service';

@Component({
  selector: 'app-categories',
  templateUrl: 'categories-page.component.html',
  styleUrls: ['categories-page.component.scss']
})
export class CategoriesPage {

  imagesPerRow: number;
  categories: DressCategory[] = [];

  constructor(
    private categoryService: CategoriesService,
    private navService: NavigationService,
  ) {

    // Number of images per row, according to the size of the screen
    this.imagesPerRow = ScreenSizeUtil.CalcScreenSizeFactor() * 2 + 0.25;

    // Get all categories
    this.categories = this.categoryService.allCategories;

  }


  /** Go to home page and filter dresses by the selected category */
  filterByCategory(categoryId: string) {
    const filter: SearchFiltersRaw = {category: categoryId};
    this.navService.search(filter);
  }

}
