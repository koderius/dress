import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild, CanActivate} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {NavigationService} from '../services/navigation.service';
import { takeWhile} from 'rxjs/operators';
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

  public isTermsRead: boolean;

  constructor(
    private authService: AuthService,
    private navService: NavigationService,
    private userData: UserDataService,
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise(resolve => {
      this.userData.userDoc$.pipe(takeWhile(user => !!user, true)).subscribe((user)=>{
        if(user) {
          resolve(true);
          console.log('Has permission');
        }
        else {
          resolve(false);
          this.navService.landing();
        }
      });
    });

  }

}
