import {Component, OnInit} from '@angular/core';
import {AuthService, UserDoc} from '../services/auth.service';
import {Order} from '../models/Order';
import {AlertsService} from '../services/Alerts.service';
import {DressSize} from '../models/Dress';
import {ObjectsUtil} from '../Utils/ObjectsUtil';


@Component({
  selector: 'app-profile',
  templateUrl: 'profile-page.component.html',
  styleUrls: ['profile-page.component.scss']
})
export class ProfilePage implements OnInit{

  userDoc: UserDoc;

  myOrders: Order[] = [];

  DressSizes = DressSize;

  constructor(
    private authService: AuthService,
    private alertService: AlertsService,
  ) {}

  ngOnInit() {

    // Get copy of user document
    this.userDoc = this.authService.currentUser;

  }

  hasChanges() {
    return !ObjectsUtil.SameValues(this.userDoc, this.authService.currentUser);
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


  async changeUserName(withError?: boolean) {
    const a = await this.alertService.alertCtrl.create({
      header: 'Change your username',
      message: withError ? 'User name must contain at least 6 alpha-numeric characters or lodash ("_"), without spaces' : '',
      inputs: [{
        placeholder: '@my-new-username',
        name: 'username',
      }],
      buttons: [
        {
          text: 'Save',
          handler: async (data)=>{
            const username = data['username'] as string;
            if(username && username.match(this.authService.PASSWORD_REGEX)) {
              await this.authService.editUserDocument({displayName: username});
              this.userDoc.displayName = username;
              this.alertService.notice('Your username has been changed');
            }
            else
              this.changeUserName(true);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    a.present();
  }

  async resetPassword() {
    if(await this.alertService.areYouSure('Reset your password?', `A reset password link will be sent to your email (${this.userDoc.email})`, 'Send', 'Cancel')) {
      await this.authService.sendResetPasswordEmail(this.userDoc.email);
      this.alertService.notice('Email has been sent. Check your inbox');
    }
  }

}
