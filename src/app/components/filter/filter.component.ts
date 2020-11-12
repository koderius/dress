import {Component, OnDestroy, OnInit} from '@angular/core';
import {CategoriesService} from '../../services/categories.service';
import {DressCategory, DressSize} from '../../models/Dress';
import {ActivatedRoute} from '@angular/router';
import {SearchFilters} from '../../models/SearchFilters';
import {NavigationService} from '../../services/navigation.service';
import {Subscription} from 'rxjs';
import {CountryData, CountryPipe} from '../../pipes/country.pipe';
import {DateInputs, DateUtil} from '../../Utils/DateUtil';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit, OnDestroy {

  unSub: Subscription;

  /** The opened filter list type (null if nothing is opened) */
  openedFilter: string;

  /** The opened criteria inside the advanced filter */
  openedStyle: boolean;
  openedSize: boolean;
  openedColor: boolean;
  openedPrice: boolean;

  get sizes() {
    return DressSize.filter(s => !!s);
  }

  /** All the categories to choose from */
  get categories() : DressCategory[] {
    return this.categoriesService.allCategories;
  };
  /** All the countries to choose from */
  countries: CountryData[] = [];

  /** The selected filters */
  filters: SearchFilters = new SearchFilters();

  date1 = new DateInputs();
  date2 = new DateInputs();

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

  clearFilters() {
    this.filters.clearFilters();
    document.querySelectorAll('ion-checkbox').forEach((el)=>{
      el.checked = false;
    });
    this.openedFilter = null;
    this.findDressClicked();
  }

  /** Get countries names list (using API) */
  refreshCountries(q = '') {
    q = q.toLowerCase();
    this.countries = CountryPipe.All()
      .filter((c)=>c.name.toLowerCase().startsWith(q) || c.alpha3Code.toLowerCase().startsWith(q) || c.alpha2Code.toLowerCase().startsWith(q));
  }

  /** Add/remove category or country to the filters */
  addFilter(name: 'category' | 'country', id: string, add: boolean) {
    const list = name == 'category' ? this.filters.categories : this.filters.countries;
    if(add)
      list.push(id);
    else
      list.splice(list.indexOf(id), 1);
  }

  checkSize(size: string, checked: boolean) {
    if(checked) {
      this.filters.size.push(size);
    } else {
      const idx = this.filters.size.indexOf(size);
      if(idx > -1) {
        this.filters.size.splice(idx, 1);
      }
    }
  }

  setDate() {
    this.filters.fromDate = this.date1.toDate();
    this.filters.toDate = this.date2.toDate();
  }

  /** Start filtering according to the selected filters (by navigating to home page under 'search' segment with query parameters */
  findDressClicked() {
    this.navService.home(this.filters.toRaw());
  }

}
