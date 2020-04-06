import { Component, OnInit } from '@angular/core';
import {CategoriesService} from '../../services/categories.service';
import {DressCategory} from '../../models/Dress';
import {CountriesUtil} from '../../Utils/CountriesUtil';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {

  openedFilter: string;

  categories: DressCategory[] = [];
  countries: string[] = [];

  constructor(
    private categoriesService: CategoriesService,
    private activeRoute: ActivatedRoute
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

  getCountries(q) {
    if(q)
      this.countries = CountriesUtil.All().filter((c)=>c.toLowerCase().startsWith(q.toLowerCase()));
    else
      this.countries = CountriesUtil.All();
  }

}
