import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dressSize'
})
export class DressSizePipe implements PipeTransform {

  transform(value: string): any {

    switch (value) {
      case 'XS': return 'X-Small';
      case 'S': return 'Small';
      case 'M': return 'Medium';
      case 'L': return 'Large';
      case 'XL': return 'X-Large';
      case 'XXL': return 'XX-Large';
      case '3XL': return '3X-Large';
      default: return value;
    }

  }

}
