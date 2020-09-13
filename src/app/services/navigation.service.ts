import {Injectable} from '@angular/core';
import {NavController} from '@ionic/angular';
import {SearchFiltersRaw} from '../models/SearchFilters';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(
    private navCtrl: NavController,
  ) {}

  // Go back to previous page, or go to home page if there are no more pages in the stack
  async back() {
    const path = window.location.pathname;
    await this.navCtrl.pop();
    if(path == window.location.pathname)
      return this.app();
  }

  landing() {
    return this.navCtrl.navigateRoot('landing');
  }

  app(tabName: string = '') {
    return this.navCtrl.navigateRoot('tabs' + (tabName ? '/' + tabName : ''));
  }

  home(queryParams: SearchFiltersRaw = null) {
    return this.navCtrl.navigateRoot('tabs/home', {
      queryParams: queryParams,
      animationDirection: 'back',
    });
  }

  profile() {
    return this.navCtrl.navigateRoot('tabs/profile');
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

  feedback(rentId: string) {
    return this.navCtrl.navigateForward('tabs/feedback/' + rentId);
  }

}
