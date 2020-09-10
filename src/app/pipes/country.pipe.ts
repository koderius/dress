import { Pipe, PipeTransform } from '@angular/core';

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
export class CountryPipe implements PipeTransform {

  private static _allCountries: CountryData[];

  /** *
   * Call rest countries API to get a list of all the countries
   */
  static async init() : Promise<void> {
    const resp = await fetch('https://restcountries.eu/rest/v2/all');
    this._allCountries = (await resp.json()) as CountryData[];
  }

  /** *
   * Get all the countries data
   */
  static All() : CountryData[] {
    return this._allCountries ? this._allCountries.slice() : [];
  }

  static GetLocaleCountryCode() : string {
    return (navigator.language.split('-')[1]) || 'US';
  }

  /** Get country by text (name / code / native name / translations...) */
  static GetCountryByText(country: string) : CountryData | undefined {
    if(country) {
      const norm = (str)=>str ? str.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase() : '';
      country = norm(country);
      return this._allCountries
        .find((ctry) =>
          ctry.alpha2Code.toLocaleLowerCase() == country ||
          ctry.alpha3Code.toLocaleLowerCase() == country ||
          norm(ctry.name) == country ||
          norm(ctry.nativeName)  == country ||
          ctry.altSpellings.map((str)=>norm(str)).includes(country) ||
          Object.values(ctry.translations).some((t)=>norm(t) == country)
        );
    }
  }

  /** From county code (default) or free text to official name */
  transform(value: string, inputType: 'freeText' | 'code' = 'code'): string | null {
    let country: CountryData;
    if(inputType == 'code')
      country = CountryPipe._allCountries.find((c)=>c.alpha2Code == value);
    if(inputType == 'freeText')
      country = CountryPipe.GetCountryByText(value);
    return country ? country.name : null;
  }

}

CountryPipe.init();
