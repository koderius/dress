import { Pipe, PipeTransform } from '@angular/core';
import {CurrencyPipe} from '@angular/common';

@Pipe({
  name: 'appCurrency'
})
export class AppCurrencyPipe implements PipeTransform {

  private selectedCurrency = 'USD';

  constructor(private currencyPipe: CurrencyPipe) {}

  transform(value: any, ...args: any[]): any {

    // Use selected currency
    args[0] = this.selectedCurrency;

    // For showing only the coin sign
    const symbolOnly = value === null;
    if(symbolOnly) {
      value = 0;
      args[2] = '0.0-0';
    }

    // Use angular's currency pipe
    let text = this.currencyPipe.transform(value, ...args);

    if(symbolOnly)
      text = text.replace('0', '');

    return text;

  }

}
