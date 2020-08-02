import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate} from '@angular/router';
import {DressEditPage} from './dress-edit.page';
import {AlertsService} from '../services/Alerts.service';
import {FilesUploaderService} from '../services/files-uploader.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveDressEditorGuard implements CanDeactivate<DressEditPage> {

  constructor(
    private alertService : AlertsService,
    private fileUploader: FilesUploaderService,
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

      // On discard, delete all the new photos
      if(answer)
        this.fileUploader.commitChanges(true);

      return answer;

    }

    // If there are no changes, enable leaving
    else
      return true;

  }

}
