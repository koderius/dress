import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyProductsPage } from './my-products-page.component';

const routes: Routes = [
  {
    path: '',
    component: MyProductsPage
  },
  {
    path: 'gallery',
    loadChildren: () => import('../my-products-gallery/my-products-gallery.module').then( m => m.MyProductsGalleryPageModule)
  },
  {
    path: 'dress-edit',
    loadChildren: () => import('../dress-edit/dress-edit.module').then( m => m.DressEditPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyProductsPageRoutingModule {}
