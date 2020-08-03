import { Component } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {ModalController} from '@ionic/angular';
import {TermsComponent} from '../components/terms/terms.component';
import {NavigationService} from '../services/navigation.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  openOptions: boolean;

  private tabChanged: boolean;

  constructor(
    public authService: AuthService,
    private modalCtrl: ModalController,
    private navService: NavigationService,
  ) {

    this.authService.onUserReady.subscribe((user)=>{
      if(!user)
        this.navService.landing();
    })

  }

  // When navigating into some tab (not including first loading), make sure to go to the tab root page, and not the last inner stack
  goToTabsRoot(ev: {tab: string}) {
    if(this.tabChanged)
      this.navService.app(ev.tab);
    else
      this.tabChanged = true;
  }

  async showOptions() {

    // Get the height of the tabs
    const tabsHeight = document.getElementsByTagName('ion-tab-bar')[0].getBoundingClientRect().height;
    document.body.style.setProperty('--tabs-height', tabsHeight+'px');

    this.openOptions = true;

  }

  async dressUpload() {
    this.navService.editDress();
    this.openOptions = false;
  }

  myProfile() {
    this.navService.profile();
    this.openOptions = false;
  }

  myOrders() {
    alert('To do');
    this.openOptions = false;
  }

  myProducts() {
    this.navService.myProducts();
    this.openOptions = false;
  }

  async openTerms() {
    this.openOptions = false;
    (await this.modalCtrl.create({component: TermsComponent})).present();
  }

  async signOut() {
    this.openOptions = false;
    // Sign out if navigation is allowed by guards
    if(await this.navService.landing())
      this.authService.signOut();
  }

}
