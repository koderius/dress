import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyProductsGalleryPage } from './my-products-gallery.page';

const routes: Routes = [
  {
    path: '',
    component: MyProductsGalleryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyProductsGalleryPageRoutingModule {}
