export class ScreenSizeUtil {

  static CalcScreenSizeFactor() {

    const screenWidth = window.innerWidth;

    if(screenWidth <= 600)
      return 1;

    if(screenWidth <= 900)
      return 2;

    if(screenWidth <= 1500)
      return 3;

    return 4;

  }

}
