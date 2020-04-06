import {Component, Input} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {CategoriesService} from '../services/categories.service';
import {Dress, DressCategory} from '../models/Dress';
import {ScreenSizeUtil} from '../Utils/ScreenSizeUtil';
import {DressesService} from '../services/dresses.service';
import {ActivatedRoute} from '@angular/router';
import {NavController} from '@ionic/angular';
import {SearchFilters, SearchFiltersRaw} from '../models/SearchFilters';

@Component({
  selector: 'app-home',
  templateUrl: 'home-page.component.html',
  styleUrls: ['home-page.component.scss']
})
export class HomePage {

  /** Whether in filter mode (instead of main homepage) */
  isFiltered: boolean;

  /** Number of items per slider, according to screen's size */
  dressSliderOptions = {slidesPerView: ScreenSizeUtil.CalcScreenSizeFactor() * 2};
  categoriesSliderOptions = {slidesPerView: ScreenSizeUtil.CalcScreenSizeFactor() * 3};

  /** All the categories */
  categories: DressCategory[] = [];

  /** Dresses to show as default */
  popular: Dress[] = this.dressService.dresses;
  forYou: Dress[] = this.dressService.dresses;

  constructor(
    private authService: AuthService,
    private activeRoute: ActivatedRoute,
    private navCtrl: NavController,
    private categoryService: CategoriesService,
    private dressService: DressesService,
  ) {

    // Check search segment in the URL
    this.activeRoute.url.subscribe((segments)=>{
      this.isFiltered = segments[0] && segments[0].path == 'search';
    });

    // Get filter query parameters from the URL (if in search segment)
    this.activeRoute.queryParams.subscribe((params: SearchFiltersRaw)=>{
      if(this.isFiltered)
        this.filter(params);
    });

    // Get all categories
    this.categories = this.categoryService.allCategories;

  }


  /** If in filter mode, go to main homepage */
  backToHome() {
    this.navCtrl.navigateRoot('tabs/home', {queryParams: {}, animationDirection: 'back'});
  }

  /** Navigate to categories tab */
  goToCategories() {
    this.navCtrl.navigateRoot('tabs/categories');
  }

  filter(params: SearchFiltersRaw) {
    const filters = new SearchFilters(params);
    //TODO: Filter request
  }

}
