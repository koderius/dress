export type CountryData = {
  name: string;
}

export class CountriesUtil {

  private static _allCountries: CountryData[];

  static async GetAll() {
    const resp = await fetch('https://restcountries.eu/rest/v2/all');
    this._allCountries = (await resp.json()) as CountryData[];
  }

  static async All() : Promise<CountryData[]> {
    if(!CountriesUtil._allCountries)
      await CountriesUtil.GetAll();
    return this._allCountries.slice();
  }

}
