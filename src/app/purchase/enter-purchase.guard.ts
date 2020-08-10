import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {PurchaseService} from './purchase.service';

@Injectable({
  providedIn: 'root'
})
export class EnterPurchaseGuard implements CanActivate {

  constructor(private purchaseService: PurchaseService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    return !!this.purchaseService.dressToRent && !!this.purchaseService.owner;
  }
  
}
