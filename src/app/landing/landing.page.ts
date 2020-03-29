import {Component, OnInit} from '@angular/core';
import {AuthService, AuthStatus} from '../services/auth.service';
import {FirebaseError, UserInfo} from 'firebase';
import {AlertsService} from '../services/Alerts.service';

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
export class LandingPage implements OnInit {

  private _pageStatus: PageStatus = PageStatus.LANDING;
  PageStatus = PageStatus;

  inputs = {
    name: '',
    email: '',
    password: '',
    passwordV: '',
  };

  isPasswordShow: boolean;

  constructor(
    public authService: AuthService,
    private alertService: AlertsService,
  ) {

    this.authService.onAuthError = (e: FirebaseError) => {
      this.alertService.notice(e.message, 'Authentication Error', e.code);
    };

  }

  ngOnInit() {
  }

  // Do not show the page before auth was loaded
  get showPage() {
    return this.authService.authStatus > AuthStatus.NOT_LOADED;
  }

  get pageStatus() : PageStatus {

    if(this.authService.authStatus == AuthStatus.ENTERED_WITH_RESET_PASSWORD_LINK)
      this._pageStatus = PageStatus.NEW_PASSWORD;
    if(this.authService.authStatus == AuthStatus.VERIFICATION_SENT)
      this._pageStatus = PageStatus.VERIFICATION_SENT;

    return this._pageStatus;

  }

  set pageStatus(status: PageStatus) {
    this._pageStatus = status;
  }


  passwordPlaceholder() : string {
    switch (this._pageStatus) {
      case PageStatus.REGISTER: return 'Create Password';
      case PageStatus.NEW_PASSWORD: return 'New Password';
      default: return 'Password';
    }
  }

  inputToShow(inputName: string) {
    let inputs = [];
    switch (this._pageStatus) {
      case PageStatus.REGISTER: inputs = ['name', 'email', 'password', 'passwordV']; break;
      case PageStatus.SIGN_IN: inputs = ['email', 'password']; break;
      case PageStatus.FORGOT_PASSWORD: inputs = ['email']; break;
      case PageStatus.NEW_PASSWORD: inputs = ['password', 'passwordV']; break;
    }
    return inputs.indexOf(inputName) > -1;
  }


  async registerClicked() {
    if(this.checkFields()) {
      // Create user
      if(await this.authService.signUpWithEmail(this.inputs.email, this.inputs.password))
        // Update his name
        await this.authService.editUserDocument({displayName: this.inputs.name} as UserInfo);
    }
  }

  async loginClicked() {
    if(this.checkFields())
      await this.authService.signInWithEmail(this.inputs.email, this.inputs.password);
  }

  async loginWithClicked(provider: 'facebook' | 'google') {
    await this.authService.signInWithProvider(provider);
  }

  async resetPasswordClicked() {
    if(this.checkFields()) {
      await this.authService.sendResetPasswordEmail(this.inputs.email);
      this._pageStatus = PageStatus.RESET_PASSWORD_EMAIL_SENT;
    }
  }

  async newPasswordClicked() {
    if(this.checkFields())
      await this.authService.resetPassword(this.inputs.password);
  }

  async resendVerification() {
    await this.authService.sendEmailVerification();
    alert('Verification email was sent');
  }

  checkFields() : boolean {

    // Must enter name
    if(this.inputToShow('name') && !this.inputs.name) {
      alert('Full name must be filled');
      return false;
    }

    // Check email is well formatted
    if(this.inputToShow('email') && !this.inputs.email.match(this.authService.emailRegex)) {
      alert('Email is bad formatted');
      return false;
    }

    // Check password is valid
    if(this.inputToShow('password') && !this.inputs.password.match(this.authService.passwordRegex)) {
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

}
