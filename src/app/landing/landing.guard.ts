import {Injectable, NgZone} from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {NavigationService} from '../services/navigation.service';
import {takeWhile} from 'rxjs/operators';
import {UserDataService} from '../services/user-data.service';

@Injectable({
  providedIn: 'root'
})
export class LandingGuard implements CanActivate {

  constructor(
    private userService: UserDataService,
    private navService: NavigationService,
    private ngZone: NgZone
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return new Promise<boolean>(resolve => {
      this.userService.userDoc$.pipe(takeWhile((user)=>!user, true)).subscribe(user => {
        resolve(!user);
        if(user) {
          console.log('User loaded');
          this.ngZone.run(()=>this.navService.app());
        }
      });
    });
  }
  
}
