export interface SearchFiltersRaw {
  category?: string;
  country?: string;
  fromdate?: string;
  todate?: string;
}


export class SearchFilters {

  categories: string[] = [];
  countries: string[] = [];
  fromDate: Date;
  toDate: Date;

  constructor(raw?: SearchFiltersRaw) {
    if(raw) {
      this.categories = (raw.category || '').split('_');
      this.countries = (raw.country || '').split('_');
      this.fromDate = raw.fromdate ?  new Date(raw.fromdate) : null;
      this.toDate = raw.todate ? new Date(raw.todate) : null;
    }
  }

  /** Transform the filters to URL query parameter (strings) */
  toRaw() : SearchFiltersRaw {
    return {
      category: this.categories.join('_'),
      country: this.countries.join('_'),
      fromdate: this.fromDate.getTime().toString(),
      todate: this.toDate.getTime().toString(),
    }
  }

}
