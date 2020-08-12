import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {CategoriesService} from '../services/categories.service';
import {Dress} from '../models/Dress';
import {ScreenSizeUtil} from '../Utils/ScreenSizeUtil';
import {DressesService} from '../services/dresses.service';
import {ActivatedRoute} from '@angular/router';
import {SearchFilters, SearchFiltersRaw} from '../models/SearchFilters';
import {NavigationService} from '../services/navigation.service';
import {LoadingController} from '@ionic/angular';
import {Observable, Subscription} from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home-page.component.html',
  styleUrls: ['home-page.component.scss']
})
export class HomePage implements OnInit, OnDestroy {

  urlSub: Subscription;

  /** Whether in filter mode (instead of main homepage) */
  filterMode: boolean;

  /** Number of items per slider, according to screen's size */
  dressSliderOptions = {slidesPerView: ScreenSizeUtil.CalcScreenSizeFactor() * 2 + 0.25};
  categoriesSliderOptions = {slidesPerView: ScreenSizeUtil.CalcScreenSizeFactor() * 3 + 0.25};

  /** Dresses to show as default */
  popular$: Observable<Dress[]> = this.dressService.mostPopular$(5);
  forYou: Dress[] = this.dressService.dresses;
  filteredDresses: Dress[] = [];

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
  ) {}

  ngOnInit(): void {
    // Check search segment in the URL, and get the query parameters
    this.urlSub = this.activeRoute.queryParams.subscribe((params: SearchFiltersRaw)=>{
      this.filterMode = !!Object.keys(params).length;
      if(this.filterMode) {
        this.filter(params);
      }
    });
  }

  ngOnDestroy(): void {
    if(this.urlSub)
      this.urlSub.unsubscribe();
  }

  async ionViewDidEnter() {
    const l = await this.loader.getTop();
    if(l)
      l.dismiss();
  }


  /** If in filter mode, go to main homepage */
  backToHome() {
    this.navService.home();
  }

  /** Navigate to categories tab */
  goToCategories() {
    this.navService.categories();
  }

  /** Search selected category */
  filterCategory(categoryId: string) {
    const sf = new SearchFilters();
    sf.categories = [categoryId];
    this.navService.home(sf.toRaw());
  }

  /** Show all the dresses, sorted by rank (= all dresses without filters) */
  showAllPopular() {
    this.navService.home({all: true});
  }

  showForYou() {
    const filters = new SearchFilters({
      // todo:
    });
    this.navService.home(filters);
  }

  async filter(params: SearchFiltersRaw) {
    this.filteredDresses = await this.dressService.filterDresses(new SearchFilters(params));
  }

}
