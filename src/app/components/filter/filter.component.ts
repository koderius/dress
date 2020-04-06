import { Component, OnInit } from '@angular/core';
import {CategoriesService} from '../../services/categories.service';
import {DressCategory} from '../../models/Dress';
import {CountriesUtil} from '../../Utils/CountriesUtil';
import {ActivatedRoute} from '@angular/router';
import {NavController} from '@ionic/angular';
import {SearchFilters} from '../../models/SearchFilters';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {

  /** The opened filter list type (null if nothing is opened) */
  openedFilter: string;

  /** All the categories to choose from */
  categories: DressCategory[] = [];
  /** All the countries to choose from */
  countries: string[] = [];

  /** The selected filters */
  filters: SearchFilters;

  constructor(
    private categoriesService: CategoriesService,
    private activeRoute: ActivatedRoute,
    private navCtrl: NavController,
  ) {

    // Close the filters when the URL is changed
    this.activeRoute.url.subscribe(()=>{
      this.openedFilter = null;
    });

    // Get categories
    this.categories = this.categoriesService.allCategories;

    // Get all countries
    CountriesUtil.GetAll().then((r)=>this.countries = r);

  }

  ngOnInit() {}

  /** Get countries list (using API) */
  getCountries(q) {
    if(q)
      this.countries = CountriesUtil.All().filter((c)=>c.toLowerCase().startsWith(q.toLowerCase()));
    else
      this.countries = CountriesUtil.All();
  }


  /** Start filtering according to the selected filters (by navigating to home page under 'search' segment with query parameters */
  findDressClicked() {
    this.navCtrl.navigateRoot('tabs/home/search', {queryParams: this.filters.toRaw()});
  }

}
