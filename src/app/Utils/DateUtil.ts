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
