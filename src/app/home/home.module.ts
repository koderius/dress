import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home-page.component';
import {ComponentsModule} from '../components/components.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {path: '', component: HomePage},
      {path: 'search', component: HomePage},
    ]),
    ComponentsModule
  ],
  declarations: [HomePage]
})
export class HomeModule {}
