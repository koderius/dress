import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DressEditPageRoutingModule } from './dress-edit-routing.module';

import { DressEditPage } from './dress-edit.page';
import {ComponentsModule} from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DressEditPageRoutingModule,
    ComponentsModule
  ],
  declarations: [DressEditPage]
})
export class DressEditPageModule {}
