import {Pipe, PipeTransform} from '@angular/core';
import * as libphonenumber from 'google-libphonenumber';
import PhoneNumberFormat = libphonenumber.PhoneNumberFormat;
import PhoneNumber = libphonenumber.PhoneNumber;

@Pipe({
  name: 'phoneNumber'
})
export class PhoneNumberPipe implements PipeTransform {

  static phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();

  /** Set the default country for parsing the phone number according to the browser **/
  private static DefaultCountry = (navigator.language.split('-')[1]) || 'US';

  /**
   * Get phone number object, according to the given string
   * If the string does not contain county code (ex: +972), use the defaultParseCountry parameter
   * */
  static GetPhoneNumber(phoneNumber: string, defaultParseCountry: string = this.DefaultCountry) : PhoneNumber {
    try {
      const tel = this.phoneUtil.parse(phoneNumber, defaultParseCountry);
      return this.phoneUtil.isValidNumber(tel) ? tel : null;
    }
    catch (e) {
      return null;
    }
  }

  /** Get a formatted phone number string */
  static PhoneToString(phone: PhoneNumber, format: PhoneNumberFormat = PhoneNumberFormat.E164) : string {
    return phone ? PhoneNumberPipe.phoneUtil.format(phone, format) : '';
  }

  /** Return the country's alpha2Code of the phone number **/
  static GetCountryCode(phone: PhoneNumber | string) : string {
    if(typeof phone == 'string')
      phone = this.GetPhoneNumber(phone);
    return phone ? this.phoneUtil.getRegionCodeForNumber(phone) : null;
  }

  /** Parse string into a phone number and show its formatted string */
  transform(
    value: string,
    defaultParseCountry: string = PhoneNumberPipe.DefaultCountry,
    format: PhoneNumberFormat
  ): string | null {
    const tel = PhoneNumberPipe.GetPhoneNumber(value, defaultParseCountry);
    return tel ? PhoneNumberPipe.PhoneToString(tel, format) : null;
  }

}
