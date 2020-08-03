import {Component, OnDestroy} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {FirebaseError} from 'firebase';
import {AlertsService} from '../services/Alerts.service';
import {ModalController} from '@ionic/angular';
import {TermsComponent} from '../components/terms/terms.component';
import {NavigationService} from '../services/navigation.service';
import {Subscription} from 'rxjs';

enum PageStatus {

  LANDING = 1,
  SIGN_IN,
  REGISTER,
  VERIFICATION_SENT,
  FORGOT_PASSWORD,
  RESET_PASSWORD_EMAIL_SENT,
  NEW_PASSWORD,

}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnDestroy {

  PageStatus = PageStatus;
  pageStatus: PageStatus = PageStatus.LANDING;

  userSub: Subscription;

  inputs = {
    name: '',
    email: '',
    password: '',
    passwordV: '',
  };

  isPasswordShow: boolean;

  isTermsRead: boolean;

  constructor(
    public authService: AuthService,
    private alertService: AlertsService,
    private modalCtrl: ModalController,
    private navService: NavigationService,
  ) {

    // When user changed
    this.userSub = this.authService.user$.subscribe(async (user)=>{

      // Check user status
      if(user) {
        // If user is verified, go into the app
        if(user.emailVerified)
          this.navService.app();

        // Else stay in unverified user status
        else
          this.pageStatus = PageStatus.VERIFICATION_SENT;
      }

      // Check whether it's a reset password mode, and change the status accordingly
      if(this.authService.mode == 'resetPassword')
        this.pageStatus = PageStatus.NEW_PASSWORD;

    });

    // Show error message when there is some auth error
    this.authService.onAuthError = (e: FirebaseError) => {
      this.alertService.notice(e.message, 'Authentication Error', e.code);
    };

  }


  // The placeholder to show in the password inputs
  passwordPlaceholder() : string {
    switch (this.pageStatus) {
      case PageStatus.REGISTER: return 'Create Password';
      case PageStatus.NEW_PASSWORD: return 'New Password';
      default: return 'Password';
    }
  }


  // Which inputs fields to show in each status
  inputToShow(inputName: string) {
    let inputs = [];
    switch (this.pageStatus) {
      case PageStatus.REGISTER: inputs = ['name', 'email', 'password', 'passwordV']; break;
      case PageStatus.SIGN_IN: inputs = ['email', 'password']; break;
      case PageStatus.FORGOT_PASSWORD: inputs = ['email']; break;
      case PageStatus.NEW_PASSWORD: inputs = ['password', 'passwordV']; break;
    }
    return inputs.indexOf(inputName) > -1;
  }


  // Open terms in a modal
  async goToTerms() {
    const m = await this.modalCtrl.create({
      component: TermsComponent,
      backdropDismiss: false,
      keyboardClose: false,
    });
    m.present();
    if((await m.onDidDismiss()).role == 'AGREE')
      this.isTermsRead = true;
  }


  // Register with email & password. (1) Open terms, (2) Create user and (3) wait for verification (email was sent)
  async registerClicked() {
    if(!this.isTermsRead)
      await this.goToTerms();
    this.alertService.showLoader('Registering...');
    if(await this.authService.signUpWithEmail(this.inputs.email, this.inputs.password, this.inputs.name))
      this.pageStatus = PageStatus.VERIFICATION_SENT;
    this.alertService.dismissLoader();
  }


  // Login with email & password (for already registered users)
  async loginClicked() {
    if(this.checkFields()) {
      this.alertService.showLoader('Logging in...');
      await this.authService.signInWithEmail(this.inputs.email, this.inputs.password);
      this.alertService.dismissLoader();
    }
  }


  // Login with facebook or google. On the first time, open the terms
  async loginWithClicked(provider: 'facebook' | 'google') {
    this.alertService.showLoader('Logging in...');
    const cred = await this.authService.signInWithProvider(provider);
    this.alertService.dismissLoader();
    if(cred.additionalUserInfo.isNewUser)
      await this.goToTerms();
  }


  // Send reset password email
  async resetPasswordClicked() {
    if(this.checkFields()) {
      this.alertService.showLoader('Sending email...');
      await this.authService.sendResetPasswordEmail(this.inputs.email);
      this.pageStatus = PageStatus.RESET_PASSWORD_EMAIL_SENT;
      this.alertService.dismissLoader();
    }
  }


  // Change password after redirected by the link
  async newPasswordClicked() {
    if(this.checkFields()) {
      this.alertService.showLoader('Restarting password');
      await this.authService.resetPassword(this.inputs.password);
      this.alertService.dismissLoader();
    }
  }


  // Send verification email again
  async resendVerification() {
    await this.authService.sendEmailVerification();
    alert('Verification email was sent');
  }


  // Check all required fields are filled and well formatted
  checkFields() : boolean {

    // Must enter name
    if(this.inputToShow('name') && !this.inputs.name) {
      alert('Full name must be filled');
      return false;
    }

    // Check email is well formatted
    if(this.inputToShow('email') && !this.inputs.email.match(this.authService.EMAIL_REGEX)) {
      alert('Email is bad formatted');
      return false;
    }

    // Check password is valid
    if(this.inputToShow('password') && !this.inputs.password.match(this.authService.PASSWORD_REGEX)) {
      alert('Password must contain at least 6 characters of letters and numbers');
      return false;
    }

    // Check both password fields are identical
    if(this.inputToShow('passwordV') && this.inputs.password != this.inputs.passwordV) {
      alert('Password confirmation is not identical to the password');
      return false;
    }

    return true;

  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

}
