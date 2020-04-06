import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyProductsPage } from './my-products-page.component';

const routes: Routes = [
  {
    path: '',
    component: MyProductsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyProductsPageRoutingModule {}
