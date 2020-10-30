import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {AlertsService} from '../services/Alerts.service';
import {Dress, DressSize} from '../models/Dress';
import {ObjectsUtil} from '../Utils/ObjectsUtil';
import {DefaultUserImage} from '../Utils/Images';
import {PhotoPopoverCtrlService} from '../components/photo-popover/photo-popover-ctrl.service';
import {FilesUploaderService} from '../services/files-uploader.service';
import {Rent} from '../models/Rent';
import {UserDataService} from '../services/user-data.service';
import {UserDoc} from '../models/User';
import {CountryPipe} from '../pipes/country.pipe';
import {PhoneNumberPipe} from '../pipes/phone-number.pipe';
import {RentService} from '../services/rent.service';
import {ScreenSizeUtil} from '../Utils/ScreenSizeUtil';
import {DressesService} from '../services/dresses.service';
import {NavigationService} from '../services/navigation.service';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile-page.component.html',
  styleUrls: ['profile-page.component.scss']
})
export class ProfilePage implements OnInit{

  EmailRegex = AuthService.EMAIL_REGEX;

  DefaultUserImage = DefaultUserImage;

  first: boolean = true;

  userDoc: UserDoc;

  myRents: Rent[] = [];
  myOrders: Dress[] = [];

  DressSizes = DressSize;

  dressSliderOptions = {slidesPerView: ScreenSizeUtil.CalcScreenSizeFactor() * 2 + 0.25};

  get userCountry() {
    return CountryPipe.GetCountryByText(this.userDoc.country);
  }

  get userPhone() {
    return PhoneNumberPipe.GetPhoneNumber(this.userDoc.phoneNumber, this.userCountry ? this.userCountry.alpha2Code : null);
  }

  get userPhoneCountry() {
    if(this.userPhone)
      return PhoneNumberPipe.GetCountryCode(this.userPhone);
  }

  getPattern(valid: boolean) {
    return valid ? '.*?' : '^\w{0,0}$';
  }

  constructor(
    private authService: AuthService,
    private userData: UserDataService,
    private alertService: AlertsService,
    private photoPopover: PhotoPopoverCtrlService,
    private fileUploader: FilesUploaderService,
    private rentsService: RentService,
    public dressService: DressesService,
    private navService: NavigationService,
  ) {}

  async ngOnInit() {

    // Get copy of user document
    this.userDoc = this.userData.currentUser;

    // Show the country's name (The saved value is the country's code)
    if(this.userDoc.country)
      this.userDoc.country = this.userCountry.name;

    this.myRents = await this.rentsService.getMyRents();
    this.myOrders.splice(0);
    this.myRents.forEach(async (rent)=>{
      this.myOrders.push(await this.dressService.loadDress(rent.dressId));
    });

  }

  ionViewDidEnter() {
    if(!this.first)
      this.ngOnInit();
    this.first = false;
  }

  // Check whether there are changes in the user's fields. Do not consider equivalent country and phone values.
  hasChanges() {
    return !ObjectsUtil.SameValues(this.convertUserData(), this.userData.currentUser);
  }

  goToView() {
    this.navService.renterView(this.userDoc.uid);
  }

  editClicked(ev) {
    const inputEl = ev.target.parentElement.getElementsByTagName('input')[0];
    // inputEl.parentElement.setAttribute('readonly', false);
    setTimeout(()=>{
      inputEl.select();
    }, 200);
  }

  convertUserData() : UserDoc {
    // Format country and phone
    return {
      ...this.userDoc,
      phoneNumber: PhoneNumberPipe.PhoneToString(this.userPhone),
      country: this.userCountry ? this.userCountry.alpha2Code : '',
    };
  }

  async saveChanges() {
    if(this.userDoc.phoneNumber && !this.userPhone)
      return this.alertService.notice('Invalid phone number', 'Input Error');
    if(this.userDoc.country && !this.userCountry)
      return this.alertService.notice('Unknown country', 'Input Error');
    this.alertService.showLoader('Saving...');
    await this.userData.editUserDocument(this.convertUserData());
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

  showPaypalInfo() {
    this.alertService.notice(
      'Enter the email address which is linked to your PayPal account',
      'PayPal account',
      'You must have an account linked to your profile in order to get payments'
    )
  }

  goToDressRank(rentId: string) {
    this.navService.feedback(rentId);
  }

}
