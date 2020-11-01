export class Colors {

  /**
   * Check whether two colors are in the same RGB range
   * @param color1 (as CSS property)
   * @param color2 (as CSS property)
   * @param tolerance - The maximum distance between two similar colors
   */
  static IsSimilar(color1: string, color2: string, tolerance: number = 0.3) {
    const rgb1 = this.ToRGB(color1);
    const rgb2 = this.ToRGB(color2);
    return this.ColorDistance(rgb1, rgb2) <= tolerance;
  }

  // The "distance" between two colors, relative to the max distance
  static ColorDistance(rgb1: number[], rgb2: number[]) {
    const maxDist = Math.sqrt(Math.pow(255,2) * 3);
    let sum = 0;
    for (let i = 0; i < 3; i++) {
      sum += Math.pow(rgb1[i] - rgb2[i], 2);
    }
    const dist = Math.sqrt(sum);
    return dist / maxDist;
  }

  // From CSS color property to RGB array
  static ToRGB(color: string) : number[] {
    const d = document.createElement("div");
    d.style.color = color;
    document.body.appendChild(d)
    color = window.getComputedStyle(d).color;
    // Will convert to "rgb(123, 123, 123)"
    color = color.slice(4, -1);
    return color.split(', ').map(c => +c);
  }

}
