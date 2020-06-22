import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DressViewPageRoutingModule } from './dress-view-routing.module';

import { DressViewPage } from './dress-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DressViewPageRoutingModule
  ],
  declarations: [DressViewPage]
})
export class DressViewPageModule {}
