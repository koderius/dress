import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[appNaturalNumber]'
})
export class NaturalNumberDirective {

  input: HTMLInputElement;

  constructor(el: ElementRef<HTMLInputElement>) {
    this.input = el.nativeElement;
    // Set default minimum as 0
    if(+this.input.min <= 0) {
      this.input.min = '0';
    }
    // Prevent non-numeric characters such as '-' '.' & 'e'
    this.input.onkeydown = (ev) => {
      if (isNaN(+ev.key) && ev.key.length === 1) {
        ev.preventDefault();
      }
    };
  }


  @HostListener('input') onInput() {
    if(this.input.max) {
      // Prevent entering more numbers than the max length
      this.input.value = this.input.value.slice(0, this.input.max.length);
      if(+this.input.value > +this.input.max) {
        this.input.value = this.input.max;
      }
    }
    // If there is an input (which is not 0 or empty) smaller than min, set the min value
    if (+this.input.value && +this.input.value < +this.input.min) {
      this.input.value = this.input.min;
    }
  }

}
