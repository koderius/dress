import { Pipe, PipeTransform } from '@angular/core';
import {DressStatus} from '../models/Dress';

@Pipe({
  name: 'dressStatus'
})
export class DressStatusPipe implements PipeTransform {

  transform(value: DressStatus, arg: string = 'title'): string {

    if(arg == 'title') {
      switch (value) {
        case DressStatus.DRAFT: return 'Draft';
        case DressStatus.OPEN: return 'Open';
        case DressStatus.RENTED: return 'Rented';
      }
    }

    if(arg == 'theme') {
      switch (value) {
        case DressStatus.OPEN: return 'success';
        case DressStatus.RENTED: return 'danger';
        default: return '';
      }
    }

  }

}
