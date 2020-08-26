import {Pipe, PipeTransform} from '@angular/core';

export type CountryData = {
  name: string;
  nativeName: string;
  altSpellings: string[];
  translations: {[lang: string] : string};
  alpha2Code: string;
  alpha3Code: string;
  flag: string;
}

@Pipe({
  name: 'country'
})
export class CountriesUtil implements PipeTransform {

  private static _AllCountries: CountryData[];

  /** Get all countries data from rest API */
  static async Init() {
    const resp = await fetch('https://restcountries.eu/rest/v2/all');
    this._AllCountries = (await resp.json()) as CountryData[];
  }

  /** List of all the countries data */
  static All() : CountryData[] {
    return this._AllCountries.slice();
  }

  /** Find country data according to free text */
  static GetCountryByText(query: string) : CountryData | null {
    if(query) {
      const norm = (str)=>str ? str.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase() : '';
      query = norm(query);
      return this._AllCountries
        .find((ctry) =>
          norm(ctry.name) == query ||
          norm(ctry.nativeName)  == query ||
          ctry.altSpellings.map((str)=>norm(str)).includes(query) ||
          Object.values(ctry.translations).some((t)=>norm(t) == query) ||
          ctry.alpha2Code.toLocaleLowerCase() == query ||
          ctry.alpha3Code.toLocaleLowerCase() == query
        ) || null;
    }
  }

  /** Current country (if was found according to the input) */
  private _country: CountryData;
  get country() {
    return this._country ? {...this._country} : null;
  }

  /** Try to find a country when input is being changed */
  private _input: string;
  get input() {
    return this._input;
  }
  set input(country: string) {
    this._input = country;
    this._country = CountriesUtil.GetCountryByText(country) || null;
  }

  /** Set a country by object or by text, and set the input to show the country's official name */
  constructor(country?: string | CountryData) {
    if(country) {
      if(typeof country == 'object')
        this._country = country;
      else
        this.input = country;
      if(this._country)
        this._input = this._country.name;
    }
  }

  hasValidCountry() : boolean {
    return !!this._country;
  }

  /** Pipe: county code (default) or free text --> official name */
  transform(value: string, inputType: 'freeText' | 'code' = 'code'): string | null {
    let country: CountryData;
    switch (inputType) {
      case 'code':
        country = CountriesUtil._AllCountries.find((c)=>c.alpha2Code == value);
        break;
      case 'freeText':
        country = CountriesUtil.GetCountryByText(value);
        break;
    }
    return country ? country.name : null;
  }

}

CountriesUtil.Init();
