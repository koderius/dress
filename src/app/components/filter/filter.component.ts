import {Component, OnDestroy, OnInit} from '@angular/core';
import {CategoriesService} from '../../services/categories.service';
import {DressCategory} from '../../models/Dress';
import {CountriesUtil, CountryData} from '../../Utils/CountriesUtil';
import {ActivatedRoute} from '@angular/router';
import {SearchFilters} from '../../models/SearchFilters';
import {NavigationService} from '../../services/navigation.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit, OnDestroy {

  unSub: Subscription;

  /** The opened filter list type (null if nothing is opened) */
  openedFilter: string;

  /** All the categories to choose from */
  get categories() : DressCategory[] {
    return this.categoriesService.allCategories;
  };
  /** All the countries to choose from */
  countries: CountryData[] = [];

  /** The selected filters */
  filters: SearchFilters = new SearchFilters();

  constructor(
    private categoriesService: CategoriesService,
    private activeRoute: ActivatedRoute,
    private navService: NavigationService,
  ) {}

  ngOnInit() {

    // Close the filters when the URL is changed
    this.unSub = this.activeRoute.queryParams.subscribe(()=>{
      this.openedFilter = null;
    });

    // Get all countries
    this.refreshCountries();
  }

  ngOnDestroy(): void {
    this.unSub.unsubscribe();
  }

  /** Get countries names list (using API) */
  refreshCountries(q = '') {
    this.countries = CountriesUtil.All()
      .filter((c)=>c.name.toLowerCase().startsWith(q.toLowerCase()));
  }

  /** Add/remove category or country to the filters */
  addFilter(name: 'category' | 'country', id: string, add: boolean) {
    const list = name == 'category' ? this.filters.categories : this.filters.countries;
    if(add)
      list.push(id);
    else
      list.splice(list.indexOf(id), 1);
  }

  /** Start filtering according to the selected filters (by navigating to home page under 'search' segment with query parameters */
  findDressClicked() {
    if(this.filters.hasFilters)
      this.navService.home(this.filters.toRaw());
  }

}
