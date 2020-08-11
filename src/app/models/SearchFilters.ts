import {Params} from '@angular/router';

export interface SearchFiltersRaw extends Params {
  category?: string;
  country?: string;
  fromdate?: string;
  todate?: string;
  all?: boolean;
}

export class SearchFilters {

  categories: string[] = [];
  countries: string[] = [];
  fromDate: Date;
  toDate: Date;

  constructor(raw?: SearchFiltersRaw) {
    if(raw) {
      this.categories = raw.category ? raw.category.split('_') : [];
      this.countries = raw.country ? raw.country.split('_') : [];
      this.fromDate = raw.fromdate ?  new Date(raw.fromdate) : null;
      this.toDate = raw.todate ? new Date(raw.todate) : null;
    }
  }

  /** Transform the filters to URL query parameter (strings) */
  toRaw() : SearchFiltersRaw {

    const raw : SearchFiltersRaw = {
      category: this.categories.join('_'),
      country: this.countries.join('_'),
      fromdate: this.fromDate ? this.fromDate.getTime().toString() : '',
      todate: this.toDate ? this.toDate.getTime().toString() : '',
    };

    for (let p in raw)
      if(!raw[p])
        delete raw[p];

    return raw;

  }

  get hasFilters() : boolean {
    return !!(this.countries.length || this.categories.length || this.toDate || this.fromDate);
  }

  clearFilters() {
    this.fromDate = this.toDate = null;
    this.categories.splice(0);
    this.countries.splice(0);
  }

}
