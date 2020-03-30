import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HeaderComponent} from './header/header.component';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {StarsComponent} from './stars/stars.component';



@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  declarations: [
    HeaderComponent,
    StarsComponent,
  ],
  exports: [
    HeaderComponent,
    StarsComponent,
  ]
})
export class ComponentsModule { }
