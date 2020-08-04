import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {NavigationService} from '../services/navigation.service';
import {first} from 'rxjs/operators';

/**
 * This guard check the authentication status in order to allow entering the app (under the tabs segment)
 * User is ready when:
 * 1. Authenticated
 * 2. Has loaded his document
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivateChild {

  constructor(
    private authService: AuthService,
    private navService: NavigationService,
  ) {}

  async canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    return new Promise<boolean>(resolve => {
      this.authService.user$.pipe(first()).subscribe((user)=>{
        if(user)
          resolve(true);
        else
          this.navService.landing();
      });
    })

  }
  
}
