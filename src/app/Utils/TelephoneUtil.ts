import * as libphonenumber from 'google-libphonenumber';
import PhoneNumber = libphonenumber.PhoneNumber;
import PhoneNumberFormat = libphonenumber.PhoneNumberFormat;

export class TelephoneUtil {

  public static phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();

  private _phone: PhoneNumber;
  private _input: string;

  get phone() {
    return this._input;
  }

  set phone(phone: string) {
    this._input = phone;
    try {
      this._phone = TelephoneUtil.phoneUtil.parse(phone, this.defaultParseCountry);
    }
    catch (e) {
      this._phone = null;
    }
  }

  constructor(phone?: string | PhoneNumber, public defaultParseCountry = 'US') {
    if(phone instanceof PhoneNumber) {
      this._phone = phone;
      this._input = this.toString();
    }
    else
      this.phone = phone;
  }

  isValid() {
    if(this._phone)
      return TelephoneUtil.phoneUtil.isValidNumber(this._phone);
  }

  toString() : string {
    if(this.isValid())
      return TelephoneUtil.phoneUtil.format(this._phone, PhoneNumberFormat.E164);
    else
      return '';
  }

  getCountryCode() : number {
    if(this._phone)
      return this._phone.getCountryCode();
  }

  getCountry() : string {
    if(this._phone)
      return TelephoneUtil.phoneUtil.getRegionCodeForCountryCode(this.getCountryCode());
  }

}
