import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild, CanActivate} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {NavigationService} from '../services/navigation.service';
import {first, map, takeWhile} from 'rxjs/operators';
import {User} from 'firebase';
import {Observable} from 'rxjs';
import {UserDataService} from '../services/user-data.service';

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
    private navService: NavigationService,
    private userData: UserDataService,
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

    return this.userData.onUserDoc.pipe(map((user) => {

      console.log(user ? `User ID: ${user.uid}` : 'No user');

      // Allow entering the page for verified user
      if(user && user.emailVerified) {
        console.log('Email verified');
        return true;
      }

      // If there is no user, or the user cannot be verified by external provider, don't allow access and throw to landing page
      else if (!user || !this.authService.tryVerify(user)) {
        console.log('No user / signed out - redirecting to landing');
        this.navService.landing();
        return false;
      }
    }))
      // Keep guard subscription as long as user is logged in
      .pipe(takeWhile(user=>!!user));

  }
  
}
