import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate} from '@angular/router';
import {DressEditPage} from './dress-edit.page';
import {AlertsService} from '../services/Alerts.service';
import {DressEditorService} from '../services/dress-editor.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveDressEditorGuard implements CanDeactivate<DressEditPage> {

  constructor(
    private alertService : AlertsService,
    private dressEditor: DressEditorService,
  ) {}

  async canDeactivate(
    component: DressEditPage,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): Promise<boolean> {

    // If there are changes, show alert message
    if(component.hasChanges()) {

      const answer = await this.alertService.areYouSure('Dress changes has not been saved', 'Leave this page without saving?', 'Discard', 'Stay');

      // If the dress was new, delete it from the server
      if(answer && component.isNew)
        this.dressEditor.deleteDress(component.dress.id);

      return answer;

    }

    // If there are no changes, enable leaving
    else
      return true;

  }

}
