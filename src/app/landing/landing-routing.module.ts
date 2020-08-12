import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LandingPage } from './landing.page';
import {LandingGuard} from './landing.guard';

const routes: Routes = [
  {
    path: '',
    component: LandingPage,
    canActivate: [LandingGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LandingPageRoutingModule {}
