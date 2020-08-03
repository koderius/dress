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

  app(tabName?: string) {
    return this.navCtrl.navigateRoot('tabs' + (tabName ? '/' + tabName : ''));
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

  myProducts() {
    return this.navCtrl.navigateForward('tabs/profile/my-products');
  }

  editDress(id: string = '') {
    return this.navCtrl.navigateForward('tabs/profile/my-products/dress-edit' + (id ? '/' + id : ''));
  }

  categories() {
    return this.navCtrl.navigateRoot('tabs/categories');
  }

}
