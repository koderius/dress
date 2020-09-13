import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DressFeedbackPage } from './dress-feedback-page.component';

const routes: Routes = [
  {
    path: ':id',
    component: DressFeedbackPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DressFeedbackPageRoutingModule {}
