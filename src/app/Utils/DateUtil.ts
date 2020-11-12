export class DateUtil {

  /**
   * 'sv' locale gives yyyy-mm-dd format, which is the current timezone date as ISO format
   * */
  static DateToISO(d: Date | number | string | null) : string {
    return d ? new Date(d).toLocaleDateString('sv') : null;
  }

  /**
   * Get Date object from any acceptable format
   * */
  static DateToDate(d: Date | number | string | null) : Date | null {
    return d ? new Date(d) : null;
  }

  /**
   * Some day Date object in midnight
   * */
  static SameDay(d: Date | number | string | null) : Date | null {
    if(!d)
      return null;
    const date = new Date(d);
    date.setHours(0,0,0,0);
    return date;
  }

  /**
   * Today's midnight
   * */
  static Today() : Date {
    return DateUtil.SameDay(Date.now());
  }

  /** *
   * Current day, as ISO yyyy-mm-dd
   */
  static TodayISO() : string {
    return DateUtil.DateToISO(Date.now());
  }

}


export class DateInputs {

  private _y?: number;
  private _m?: number;
  private _d?: number;

  get y() {
    return this._y;
  }

  get m() {
    return this._m;
  }

  get d() {
    return this._d;
  }

  set y(y: number | undefined) {
    if(y || y === 0) {
      this._y = y;
      this.correctDay();
    } else {
      this._y = undefined;
    }
  }

  set m(m: number | undefined) {
    if(m) {
      if(m > 0 && m <= 12) {
        this._m = m;
      }
      this.correctDay();
    } else {
      this._m = undefined;
    }
  }

  set d(d: number | undefined) {
    if(d) {
      if(d > 0 && d <= 31) {
        this._d = d;
      }
      this.correctDay();
    } else {
      this._d = undefined;
    }
  }

  private lastDay() : number {
    if(this._m) {
      const d = new Date(this._y || new Date().getFullYear(), this._m, 0);
      return d.getDate();
    } else {
      return 31;
    }
  }

  private correctDay() {
    if (this._d > this.lastDay()) {
      this._d = this.lastDay();
    }
  }

  public toDate() : Date | undefined {
    if(this._y && this._m && this._d) {
      return new Date(this._y, this._m - 1, this._d);
    }
  }

}
