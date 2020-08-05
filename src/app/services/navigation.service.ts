import { Injectable } from '@angular/core';
import {NavController} from '@ionic/angular';
import {SearchFiltersRaw} from '../models/SearchFilters';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(
    private navCtrl: NavController,
  ) {}

  landing() {
    return this.navCtrl.navigateRoot('landing');
  }

  app(tabName: string = '') {
    return this.navCtrl.navigateRoot('tabs/' + tabName);
  }

  home() {
    return this.navCtrl.navigateRoot('tabs/home', {queryParams: {}, animationDirection: 'back'});
  }

  search(queryParams: SearchFiltersRaw) {
    return this.navCtrl.navigateRoot('tabs/home/search', {queryParams: queryParams});
  }

  profile() {
    return this.navCtrl.navigateForward('tabs/profile')
  }

  myProducts(gallery?: boolean) {
    return this.navCtrl.navigateForward('tabs/profile/my-products' + (gallery ? '/gallery' : ''));
  }

  editDress(id: string = '') {
    if(id)
      id = '/' + id;
    return this.navCtrl.navigateForward('tabs/profile/my-products/dress-edit' + id);
  }

  categories() {
    return this.navCtrl.navigateRoot('tabs/categories');
  }

  dressView(id: string) {
    return this.navCtrl.navigateForward('tabs/dress-view/' + id);
  }

  renterView(uid: string) {
    return this.navCtrl.navigateForward('tabs/renter-profile/' + uid);
  }

  chat(withUid: string) {
    if(withUid)
      return this.navCtrl.navigateForward('tabs/chat/' + withUid);
  }

}
