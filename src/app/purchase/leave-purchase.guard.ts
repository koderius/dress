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

    // Allow leave after authorization
    if(component && component.canLeave)
      return true;

    const answer = await this.alertService.areYouSure('Leave purchase process?','','Leave', 'Stay');
    await this.alertService.alertCtrl.dismiss();
    this.alertService.alertCtrl.dismiss().catch(()=>{});
    if(answer) {
      this.purchaseService.stopPurchase();
      return true;
    }
    else
      return false;

  }

}
