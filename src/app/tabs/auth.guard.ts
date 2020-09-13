import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate} from '@angular/router';
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
    private navService: NavigationService,
    private userData: UserDataService,
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise(resolve => {
      this.userData.userDoc$.subscribe((user)=>{
        if(user) {
          resolve(true);
          console.log('Can enter app');
        }
        else if(user === null) {
          resolve(false);
          console.log('No logged-in user - leaving app');
          this.navService.landing();
        }
      });
    });

  }

}
