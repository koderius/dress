import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyProductsPage } from './my-products-page.component';

const routes: Routes = [
  {
    path: '',
    component: MyProductsPage
  },
  {
    path: 'dress-edit',
    loadChildren: () => import('../dress-edit/dress-edit.module').then( m => m.DressEditPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyProductsPageRoutingModule {}
