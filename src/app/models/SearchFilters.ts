import {Params} from '@angular/router';

export interface SearchFiltersRaw extends Params {
  category?: string;
  country?: string;
  fromdate?: string;
  todate?: string;
  all?: boolean;

  style?: string;
  size?: string;
  color?: string;
  fromPrice?: string;
  toPrice?: string;
}

export class SearchFilters {

  // Base
  categories: string[] = [];
  countries: string[] = [];
  fromDate: Date;
  toDate: Date;

  // Advance
  style: string;
  size: string[] = [];
  color: string;
  fromPrice: number;
  toPrice: number;

  constructor(raw?: SearchFiltersRaw) {
    if(raw) {
      this.categories = raw.category ? raw.category.split('_') : [];
      this.countries = raw.country ? raw.country.split('_') : [];
      this.fromDate = raw.fromdate ?  new Date(raw.fromdate) : null;
      this.toDate = raw.todate ? new Date(raw.todate) : null;
      this.style = raw.style || '';
      this.size = raw.size ? raw.size.split('_') : [];
      this.color = raw.color || '';
      this.fromPrice = +raw.fromPrice;
      this.toPrice = +raw.toPrice;
    }
  }

  /** Transform the filters to URL query parameter (strings) */
  toRaw() : SearchFiltersRaw {

    const raw : SearchFiltersRaw = {
      category: this.categories.join('_'),
      country: this.countries.join('_'),
      fromdate: this.fromDate ? this.fromDate.toJSON().slice(0,10) : '',
      todate: this.toDate ? this.toDate.toJSON().slice(0,10) : '',
      style: this.style,
      size: this.size.join('_'),
      color: this.color,
      fromPrice: (this.fromPrice || '').toString(),
      toPrice: (this.toPrice || '').toString(),
    };

    for (let p in raw)
      if(!raw[p])
        delete raw[p];

    return raw;

  }

  get hasFilters() : boolean {
    return !!(
      this.countries.length || this.categories.length || this.toDate || this.fromDate ||
        this.fromPrice || this.toPrice || this.color || this.size.length || this.style
    );
  }

  clearFilters() {
    this.fromDate = this.toDate = null;
    this.categories.splice(0);
    this.countries.splice(0);
    this.size.splice(0);
    this.style = this.color = '';
    this.fromPrice = this.toPrice = null;
  }

}
