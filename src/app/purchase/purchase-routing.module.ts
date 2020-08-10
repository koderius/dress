import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PurchasePage } from './purchase.page';
import {EnterPurchaseGuard} from './enter-purchase.guard';

const routes: Routes = [
  {
    path: ':step',
    component: PurchasePage,
    canActivate: [EnterPurchaseGuard],
  },
  {
    path: '',
    redirectTo: '1',
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchasePageRoutingModule {}
