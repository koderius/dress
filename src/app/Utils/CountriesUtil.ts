export class CountriesUtil {

  private static _allCountries: string[];

  static async GetAll() {
    const resp = await fetch('https://restcountries.eu/rest/v2/all');
    const list = (await resp.json()) as any[];
    this._allCountries = list.map((c)=>c['name']);
    return this._allCountries.slice();
  }

  static All() {
    if(!CountriesUtil._allCountries)
      CountriesUtil.GetAll();
    else
      return this._allCountries.slice();
  }

}
