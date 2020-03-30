import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RenterProfilePageRoutingModule } from './renter-profile-routing.module';

import { RenterProfilePage } from './renter-profile-page.component';
import {ComponentsModule} from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RenterProfilePageRoutingModule,
    ComponentsModule,
  ],
  declarations: [RenterProfilePage],
})
export class RenterProfilePageModule {}
