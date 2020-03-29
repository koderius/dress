import {Component, OnInit} from '@angular/core';
import {AuthService, AuthStatus} from '../services/auth.service';
import {NavController} from '@ionic/angular';

enum PageStatus {

  // If the user is already signed, the page should redirect to the app
  USER_SIGNED = 0,

  LANDING,
  SIGN_IN,
  REGISTER,
  NOT_VERIFIED,
  FORGOT_PASSWORD,
  NEW_PASSWORD,

}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {

  private _pageStatus: PageStatus;
  PageStatus = PageStatus;

  constructor(
    private authService: AuthService,
  ) { }

  ngOnInit() {
  }

  get pageStatus() : PageStatus {

    if(this.authService.authStatus == AuthStatus.ENTERED_WITH_RESET_PASSWORD_LINK)
      this._pageStatus = PageStatus.NEW_PASSWORD;
    if(this.authService.authStatus == AuthStatus.EMAIL_NOT_VERIFIED)
      this._pageStatus = PageStatus.NOT_VERIFIED;

    return this._pageStatus;

  }

  set pageStatus(status: PageStatus) {
    this._pageStatus = status;
  }

}
