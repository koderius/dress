import { Component } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {ModalController, NavController} from '@ionic/angular';
import {TermsComponent} from '../components/terms/terms.component';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  openOptions: boolean;

  constructor(
    public authService: AuthService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
  ) {

    this.authService.onUserReady.subscribe((user)=>{
      if(!user)
        this.navCtrl.navigateRoot('landing');
    })

  }

  async showOptions() {

    // Get the height of the tabs
    const tabsHeight = document.getElementsByTagName('ion-tab-bar')[0].getBoundingClientRect().height;
    document.body.style.setProperty('--tabs-height', tabsHeight+'px');

    this.openOptions = true;

  }

  click() {
    alert('asdf');
  }

  async openTerms() {
    this.openOptions = false;
    (await this.modalCtrl.create({component: TermsComponent})).present();
  }

  async signOut() {
    this.openOptions = false;
    // Sign out if navigation is allowed by guards
    if(await this.navCtrl.navigateRoot('landing'))
      this.authService.signOut();
  }

}
