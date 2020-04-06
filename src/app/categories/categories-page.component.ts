import { Component } from '@angular/core';
import {DressCategory} from '../models/Dress';
import {CategoriesService} from '../services/categories.service';
import {ScreenSizeUtil} from '../Utils/ScreenSizeUtil';

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
  ) {

    this.imagesPerRow = ScreenSizeUtil.CalcScreenSizeFactor() * 2;

    // Get all categories
    this.categories = this.categoryService.allCategories;

  }

}
