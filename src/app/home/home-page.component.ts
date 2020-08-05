import {Component, Input} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {CategoriesService} from '../services/categories.service';
import {Dress} from '../models/Dress';
import {ScreenSizeUtil} from '../Utils/ScreenSizeUtil';
import {DressesService} from '../services/dresses.service';
import {ActivatedRoute} from '@angular/router';
import {SearchFilters, SearchFiltersRaw} from '../models/SearchFilters';
import {NavigationService} from '../services/navigation.service';
import {LoadingController} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home-page.component.html',
  styleUrls: ['home-page.component.scss']
})
export class HomePage {

  /** Whether in filter mode (instead of main homepage) */
  isFiltered: boolean;

  /** Number of items per slider, according to screen's size */
  dressSliderOptions = {slidesPerView: ScreenSizeUtil.CalcScreenSizeFactor() * 2 + 0.25};
  categoriesSliderOptions = {slidesPerView: ScreenSizeUtil.CalcScreenSizeFactor() * 3 + 0.25};

  /** Dresses to show as default */
  popular: Dress[] = this.dressService.dresses;
  forYou: Dress[] = this.dressService.dresses;

  get categories() {
    return this.categoryService.allCategories;
  }

  constructor(
    private authService: AuthService,
    private activeRoute: ActivatedRoute,
    private navService: NavigationService,
    private categoryService: CategoriesService,
    private dressService: DressesService,
    private loader: LoadingController,
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

  }

  ionViewDidEnter() {
    this.loader.dismiss();
  }


  /** If in filter mode, go to main homepage */
  backToHome() {
    this.navService.home();
  }

  /** Navigate to categories tab */
  goToCategories() {
    this.navService.categories();
  }

  filter(params: SearchFiltersRaw) {
    const filters = new SearchFilters(params);
    //TODO: Filter request
  }

}
