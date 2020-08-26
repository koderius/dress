import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {AlertsService} from '../services/Alerts.service';
import {DressSize} from '../models/Dress';
import {ObjectsUtil} from '../Utils/ObjectsUtil';
import {DefaultUserImage} from '../Utils/Images';
import {PhotoPopoverCtrlService} from '../components/photo-popover/photo-popover-ctrl.service';
import {FilesUploaderService} from '../services/files-uploader.service';
import {Rent} from '../models/Rent';
import {UserDataService} from '../services/user-data.service';
import {UserDoc} from '../models/User';
import {TelephoneUtil} from '../Utils/TelephoneUtil';
import {CountriesUtil} from '../Utils/CountriesUtil';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile-page.component.html',
  styleUrls: ['profile-page.component.scss']
})
export class ProfilePage implements OnInit{

  DefaultUserImage = DefaultUserImage;

  userDoc: UserDoc;

  myRents: Rent[] = [];

  DressSizes = DressSize;

  phoneNum: TelephoneUtil;
  country: CountriesUtil;

  get phoneNumPattern() {
    return this.phoneNum.isValid() ? '.*?' : '^\w{0,0}$';
  }

  get countryNamePattern() {
    return this.country.hasValidCountry() ? '.*?' : '^\w{0,0}$';
  }

  constructor(
    private authService: AuthService,
    private userData: UserDataService,
    private alertService: AlertsService,
    private photoPopover: PhotoPopoverCtrlService,
    private fileUploader: FilesUploaderService,
  ) {}

  ngOnInit() {

    // Get copy of user document
    this.userDoc = this.userData.currentUser;

    this.phoneNum = new TelephoneUtil(this.userDoc.phoneNumber, this.userDoc.country);
    this.country = new CountriesUtil(this.userDoc.country);

  }

  ionViewDidEnter() {
    this.ngOnInit();
  }

  hasChanges() {
    return !ObjectsUtil.SameValues({...this.userDoc}, this.userData.currentUser) ||
      (this.country.country && this.country.country.alpha2Code) != this.userDoc.country ||
      this.phoneNum.toString() != (this.userDoc.phoneNumber || '');
  }

  editClicked(ev) {
    const inputEl = ev.target.parentElement.getElementsByTagName('input')[0];
    // inputEl.parentElement.setAttribute('readonly', false);
    setTimeout(()=>{
      inputEl.select();
    }, 200);
  }

  async saveChanges() {
    if(this.phoneNum.phone && !this.phoneNum.isValid())
      return this.alertService.notice('Invalid phone number', 'Input Error');
    else
      this.userDoc.phoneNumber = this.phoneNum.toString();
    if(this.country && !this.country.hasValidCountry())
      return this.alertService.notice('Unknown country', 'Input Error');
    else
      this.userDoc.country = this.country.country.alpha2Code;
    this.alertService.showLoader('Saving...');
    await this.userData.editUserDocument({...this.userDoc});
    this.ngOnInit();
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
            if(username && username.match(AuthService.PASSWORD_REGEX)) {
              await this.userData.editUserDocument({displayName: username});
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

  async userPhotoActionSheet() {
    const res = await this.photoPopover.openActionSheet(this.userDoc.photoURL, true);
    if(res.role == 'destructive') {
      this.fileUploader.deleteUserPhoto(this.userDoc.uid);
      this.userDoc.photoURL = null;
      this.saveChanges();
    }
  }

  async setUserPhoto(ev) {
    const file = ev.target.files[0];
    await this.alertService.showLoader('Uploading photo...');
    this.userDoc.photoURL = await this.fileUploader.uploadUserPhoto(file, this.userDoc.uid);
    await this.alertService.dismissLoader();
    this.saveChanges();
  }

  async resetPassword() {
    if(await this.alertService.areYouSure('Reset your password?', `A reset password link will be sent to your email (${this.userDoc.email})`, 'Send', 'Cancel')) {
      await this.authService.sendResetPasswordEmail(this.userDoc.email);
      this.alertService.notice('Email has been sent. Check your inbox');
    }
  }

}
