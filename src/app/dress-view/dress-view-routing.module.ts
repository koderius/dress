import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DressViewPage } from './dress-view.page';

const routes: Routes = [
  {
    path: ':id',
    component: DressViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DressViewPageRoutingModule {}
