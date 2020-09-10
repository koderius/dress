import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchasePageRoutingModule } from './purchase-routing.module';

import { PurchasePage } from './purchase.page';
import {ComponentsModule} from '../components/components.module';
import {NgxPayPalModule} from 'ngx-paypal';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PurchasePageRoutingModule,
    ComponentsModule,
    NgxPayPalModule,
  ],
  declarations: [PurchasePage]
})
export class PurchasePageModule {}
