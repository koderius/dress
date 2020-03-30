import {Component, OnInit} from '@angular/core';
import {AuthService, UserDoc} from '../services/auth.service';
import {Order} from '../models/Order';
import {AlertsService} from '../services/Alerts.service';


@Component({
  selector: 'app-profile',
  templateUrl: 'profile-page.component.html',
  styleUrls: ['profile-page.component.scss']
})
export class ProfilePage implements OnInit{

  userDoc: UserDoc;

  myOrders: Order[] = [];

  constructor(
    private authService: AuthService,
    private alertService: AlertsService,
  ) {}

  ngOnInit() {

    // Get copy of user document
    this.userDoc = this.authService.currentUser;

  }

  hasChanges() {
    return JSON.stringify(this.userDoc) != JSON.stringify(this.authService.currentUser);
  }

  editClicked(ev) {
    const inputEl = ev.target.parentElement.getElementsByTagName('input')[0];
    // inputEl.parentElement.setAttribute('readonly', false);
    setTimeout(()=>{
      inputEl.select();
    }, 200);
  }

  async saveChanges() {
    this.alertService.showLoader('Saving...');
    await this.authService.editUserDocument(this.userDoc);
    this.userDoc = this.authService.currentUser;
    this.alertService.dismissLoader();
  }

}
