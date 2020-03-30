import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate} from '@angular/router';
import {AlertsService} from '../services/Alerts.service';
import {ProfilePage} from './profile-page.component';

/**
 * This Guard check whether there are changes in the user's profile edit page, and prevent leaving without alert message
 * */

@Injectable({
  providedIn: 'root'
})
export class LeaveProfileGuard implements CanDeactivate<ProfilePage> {

  constructor(private alertService: AlertsService) {}

  async canDeactivate(
    component: ProfilePage,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): Promise<boolean> {

    // If there are changes, show alert message
    if(component.hasChanges())
      return await this.alertService.areYouSure('Profile changes has not been saved', 'Leave this page without saving?', 'Discard', 'Stay');

    // If there are no changes, enable leaving
    else
      return true;

  }
  
}
