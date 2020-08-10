import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate} from '@angular/router';
import {AlertsService} from '../services/Alerts.service';
import {PurchaseService} from './purchase.service';
import {PurchasePage} from './purchase.page';

@Injectable({
  providedIn: 'root'
})
export class LeavePurchaseGuard implements CanDeactivate<PurchasePage> {

  constructor(
    private alertService : AlertsService,
    private purchaseService: PurchaseService,
  ) {}

  async canDeactivate(
    component: PurchasePage,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): Promise<boolean> {

    const answer = await this.alertService.areYouSure('Leave purchase process?','','Leave', 'Stay');
    // Handling double trigger
    setTimeout(async ()=>{
      const previous = await this.alertService.alertCtrl.getTop();
      if(previous)
        previous.dismiss();
    });
    if(answer) {
      this.purchaseService.stopPurchase();
      return true;
    }
    else
      return false;

  }

}
