import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyProductsGalleryPageRoutingModule } from './my-products-gallery-routing.module';

import { MyProductsGalleryPage } from './my-products-gallery.page';
import {ComponentsModule} from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyProductsGalleryPageRoutingModule,
    ComponentsModule
  ],
  declarations: [MyProductsGalleryPage]
})
export class MyProductsGalleryPageModule {}
