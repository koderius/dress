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

    let answer = true;

    // If there are changes, show alert message
    if(component.hasChanges() || component.hasUploadsInProgress()) {

      if(component.hasChanges()) {
        answer = await this.alertService.areYouSure(
          'Dress changes has not been saved',
          'Leave this page without saving?',
          'Discard',
          'Stay'
        );
      }
      else {
        answer = await this.alertService.areYouSure(
          'Some photos are still uploading.',
          'Leave this page before done uploading?',
          'Discard',
          'Stay'
        );
      }

      // On discard, delete all the new photos, and cancel uploads in progress
      if(answer) {
        component.photosInProgress.forEach((p)=>p.task.cancel());
        this.fileUploader.commitChanges(true);
      }

      await this.alertService.alertCtrl.dismiss();
      this.alertService.alertCtrl.dismiss().catch(()=>{});

    }

    return answer;

  }

}
