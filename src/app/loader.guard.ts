import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {LoadingController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoaderGuard implements CanActivate {

  constructor(private loadCtrl: LoadingController) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<true> {

    if(!await this.loadCtrl.getTop()) {
      const l = await this.loadCtrl.create({message: 'Loading...'});
      await l.present();
    }

    return true;

  }
  
}
