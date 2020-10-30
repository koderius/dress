import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IonInput} from '@ionic/angular';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements OnInit {

  color: string = 'white';

  @Input() theme: string;

  @Input() label: string;

  get ngModel() {
    return this.color;
  }
  @Input() set ngModel(value: string) {
    this.color = value;
    this.ngModelChange.emit(value);
  }

  @Output() ngModelChange = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {}

  async openColorPicker(input: IonInput) {
    const el = await input.getInputElement();
    el.click()
  }

}
