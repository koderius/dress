export type CountryData = {
  name: string;
  nativeName: string;
  altSpellings: string[];
  translations: {[lang: string] : string};
  alpha2Code: string;
  alpha3Code: string;
  flag: string;
}

export class CountriesUtil {

  private static _allCountries: CountryData[];

  static async GetAll() {
    const resp = await fetch('https://restcountries.eu/rest/v2/all');
    this._allCountries = (await resp.json()) as CountryData[];
  }

  static All() : CountryData[] {
    return this._allCountries.slice();
  }

  static GetCountryByText(country: string) {
    if(country) {
      const norm = (str)=>str ? str.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase() : '';
      country = norm(country);
      return this._allCountries
        .find((ctry) =>
          norm(ctry.name) == country ||
          norm(ctry.nativeName)  == country ||
          ctry.altSpellings.map((str)=>norm(str)).includes(country) ||
          Object.values(ctry.translations).some((t)=>norm(t) == country) ||
          ctry.alpha2Code.toLocaleLowerCase() == country ||
          ctry.alpha3Code.toLocaleLowerCase() == country
        );
    }
  }


  private _country: CountryData;
  private _input: string;

  constructor(name?: string | CountryData) {
    if(name) {
      if(typeof name == 'object')
        this._country = name;
      else
        this.country = name;
      if(this._country)
        this._input = this._country.name;
    }
  }

  get country() {
    return this._input;
  }

  set country(country: string) {
    this._input = country;
    this._country = CountriesUtil.GetCountryByText(country) || null;
  }

  hasCountry() {
    return !!this._country;
  }

  getCountry() {
    if(this.hasCountry())
      return {...this._country};
    else
      return null;
  }

}

CountriesUtil.GetAll();
