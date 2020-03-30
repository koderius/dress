import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RenterProfilePage } from './renter-profile-page.component';

const routes: Routes = [
  {
    path: ':uid',
    component: RenterProfilePage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RenterProfilePageRoutingModule {}
