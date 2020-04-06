import { Component } from '@angular/core';
import {DressCategory} from '../models/Dress';
import {CategoriesService} from '../services/categories.service';
import {ScreenSizeUtil} from '../Utils/ScreenSizeUtil';
import {NavController} from '@ionic/angular';
import {SearchFiltersRaw} from '../models/SearchFilters';

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
    private navCtrl: NavController,
  ) {

    // Number of images per row, according to the size of the screen
    this.imagesPerRow = ScreenSizeUtil.CalcScreenSizeFactor() * 2;

    // Get all categories
    this.categories = this.categoryService.allCategories;

  }


  /** Go to home page and filter dresses by the selected category */
  filterByCategory(categoryId: string) {
    const filter: SearchFiltersRaw = {category: categoryId};
    this.navCtrl.navigateRoot('tabs/home/search',{queryParams: filter});
  }

}
