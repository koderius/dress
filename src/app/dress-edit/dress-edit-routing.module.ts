import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DressEditPage } from './dress-edit.page';
import {LeaveDressEditorGuard} from './leave-dress-editor.guard';

const routes: Routes = [
  {
    path: ':id',
    component: DressEditPage,
    canDeactivate: [LeaveDressEditorGuard],
  },
  {
    path: '',
    redirectTo: 'new'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DressEditPageRoutingModule {}
