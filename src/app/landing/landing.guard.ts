import {Injectable, NgZone} from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
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

  // Can enter the landing page as long as there is no user
  // Keep subscribe until there is a valid user, and then redirect to the app's main page
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.userService.userDoc$.pipe(takeWhile((user)=>!user, true)).subscribe(user => {
        resolve(!user);
        if(user)
          this.ngZone.run(()=>this.navService.app());
      });
    });
  }
  
}
