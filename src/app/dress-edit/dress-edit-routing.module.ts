import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DressEditPage } from './dress-edit.page';
import {LeaveDressEditorGuard} from './leave-dress-editor.guard';
import {NoStackGuard} from '../no-stack.guard';

const routes: Routes = [
  {
    path: ':id',
    component: DressEditPage,
    canDeactivate: [LeaveDressEditorGuard],
  },
  {
    path: '',
    redirectTo: 'new-dress'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DressEditPageRoutingModule {}
