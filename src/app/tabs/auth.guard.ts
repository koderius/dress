import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {AuthService} from '../services/auth.service';
import {NavController} from '@ionic/angular';

/**
 * This guard check the authentication status in order to allow entering the app (under the tabs segment)
 * User is ready when:
 * 1. Authenticated
 * 2. Has loaded his document
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {

    // If user's document exist (user is logged in and ready), allow entering
    if(this.authService.currentUser)
      return true;

    // Wait for user to be ready within 5 seconds
    const res = await new Promise<boolean>(resolve => {

      this.authService.onUserReady.subscribe((user)=>resolve(!!user));

      setTimeout(()=>{resolve(false)}, 5000);

    });

    // If no user, redirect to landing page
    if(!res)
      this.navCtrl.navigateRoot('landing');

    return res;

  }
  
}
