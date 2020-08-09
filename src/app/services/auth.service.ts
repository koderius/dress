import {EventEmitter, Injectable} from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/functions';
import {FirebaseError, User} from 'firebase';
import UserCredential = firebase.auth.UserCredential;
import {ActivatedRoute} from '@angular/router';
import {AlertsService} from './Alerts.service';
import {UserDoc} from '../models/User';
import {Observable} from 'rxjs';

/**
 * This service is used for authentication actions.
 *
 * This service includes signing up with providers (google\facebook) or with email & password, reset password & deleting user.
 *
 * @Email_verification: All providers, except email + password, will be considered as email verified (automatically by firebase, or manually
 * through a cloud function that will force email verification).
 * For email + password registration, an email with a link will be sent to the user for verification.
 *
 * @Deleting_user: A cloud function that handles the user's data deletion should be deployed
 *
 */

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /** Firebase auth module - for the use of this service only **/
  private auth = firebase.auth();

  /** The params that are being read from the URL (for email verification, reset password...) */
  private _mode: string;
  private _oobCode: string;
  private _emailFromURL: string;

  /** On auth state changed, check user verification (and try verify, and then emit the user) */
  public user$ = new Observable<User | null>(subscriber => {
    subscriber.add(this.auth.onAuthStateChanged(async (user)=>{
      await this.checkProviderVerification(user);
      subscriber.next(user);
    }));
  });

  /** Regular expresion for password (alphanumeric + underscore, minimum 6 chars) */
  public static readonly PASSWORD_REGEX = '^[a-zA-Z0-9_]{6,}$';

  /** Regular expresion for email address */
  public static readonly EMAIL_REGEX = '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$';


  constructor(
    private activatedRoute: ActivatedRoute,
    private alertsService: AlertsService,
  ) {}


  /** Auth error notification */
  private async onAuthError(e: FirebaseError) {
    console.error(e);
    await this.alertsService.notice(e.message, 'Authentication Error', `${e.name}: ${e.code}`);
  }

  /** Mode that redirected from URL (reset password / email verification) */
  get mode() : string {
    return this._mode;
  }

  /** The email which the URL was redirected from */
  get emailFromURL() : string {
    return this._emailFromURL;
  }

  /** Current user according to auth module */
  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  /** Act according to URL parameters */
  async checkURL() {

    // Prevent reading URL twice
    if(this._mode)
      return;

    // Get URL parameters
    const params = this.activatedRoute.snapshot.queryParams;
    this._mode = params['mode'];
    this._oobCode = params['oobCode'];

    try {
      switch (this._mode) {

        case 'resetPassword':
          this._emailFromURL = await this.auth.verifyPasswordResetCode(this._oobCode);
          break;

        case 'verifyEmail':
          const info = await this.auth.checkActionCode(this._oobCode);
          if(info) {
            this._emailFromURL = info.data.email;
            await this.auth.applyActionCode(this._oobCode);
            await this.alertsService.notice(`Email ${this._emailFromURL} verified`);
            await this.currentUser.reload();
          }
          break;

      }
    }
    catch (e) {
      this.onAuthError(e);
    }

  }


  /** Sign up new users with email & password */
  async signUpWithEmail(email: string, password: string, name?: string, photo?: string) : Promise<UserCredential> {

    try {

      // Create new user with email & password
      const cred = await this.auth.createUserWithEmailAndPassword(email, password);

      // Set basic details
      cred.user.updateProfile({
        displayName: name || null,
        photoURL: photo || null
      } as UserDoc);

      // Send verification email
      this.sendEmailVerification();

      return cred;

    }
    catch (e) {
      this.onAuthError(e);
    }

  }


  /** Sign in existing users with email & password */
  async signInWithEmail(email: string, password: string) : Promise<UserCredential> {
    try {
      return await this.auth.signInWithEmailAndPassword(email, password);
    }
    catch (e) {
      this.onAuthError(e);
    }
  }


  /**
   * Sign in users with google or facebook provider
   * @param type - The provider type: 'google' or 'facebook'
   * @param method - Can be popup window, or redirect to page (recommended for mobiles)
   */
  async signInWithProvider(type: 'google' | 'facebook', method?: 'popup' | 'redirect') : Promise<UserCredential> {

    // Create provider for google or facebook sign-in
    let provider;
    switch (type) {
      case 'google': provider = new firebase.auth.GoogleAuthProvider(); break;
      case 'facebook': provider = new firebase.auth.FacebookAuthProvider(); break;
    }

    // If method was not defined in the argument, choose it according to the platform
    if(!method)
      // method = this.platform.is('mobile') ? 'redirect' : 'popup';
      method = 'popup';
    //TODO: Redirect does not work well

    try {

      // Use redirect or popup
      let cred: UserCredential;
      if(method == 'popup')
        cred = await this.auth.signInWithPopup(provider);
      if(method == 'redirect') {
        await this.auth.signInWithRedirect(provider);
        cred = await this.auth.getRedirectResult();
      }

      return cred;

    }
    catch (e) {
      this.onAuthError(e);
    }

  }

  /** Call cloud function for verifying external providers (i.e facebook) that do not auto verify */
  private async checkProviderVerification(user: User, retry?: boolean) : Promise<void> {
    if(user && !user.emailVerified && user.providerId != 'password') {
      const verifyEmail = firebase.functions().httpsCallable('tryVerifyUserEmail');
      console.log('Try verifying external auth provider...', retry ? 'retry...' : '');
      const r = await verifyEmail();
      if(r)
        await user.reload();
      else if(!retry)
        await this.checkProviderVerification(user, true);
    }
  }

  /** Update the user authentication data */
  async updateUserData(profile: {username?: string, photoURL?: string, phoneNumber?: string}) : Promise<boolean> {
    try {
      if(profile.phoneNumber) {
        // TODO? this.currentUser.updatePhoneNumber()
      }
      if(profile.username || profile.photoURL)
        await this.currentUser.updateProfile(profile);
      return true;
    }
    catch (e) {
      this.onAuthError(e);
    }
  }

  /** Send the user an email with verification link */
  async sendEmailVerification() {
    try {
      await this.currentUser.sendEmailVerification();
    }
    catch (e) {
      this.onAuthError(e);
    }
  }

  /** Send the user a reset password email */
  async sendResetPasswordEmail(email: string) {
    try {
      await this.auth.sendPasswordResetEmail(email);
    }
    catch (e) {
      this.onAuthError(e);
    }
  }

  /** Reset the password after entering the app through the reset password link */
  async resetPassword(newPassword: string) : Promise<void> {
    try {
      if(this._oobCode) {
        await this.auth.confirmPasswordReset(this._oobCode, newPassword);
        await this.signInWithEmail(this._emailFromURL, newPassword);
      }
    }
    catch (e) {
      this.onAuthError(e);
    }
  }


  /** Sign out... */
  async signOut() : Promise<void> {
    try {
      await this.auth.signOut();
    }
    catch (e) {
      this.onAuthError(e);
    }
  }


  /** Delete the current user */
  async deleteUser() {
    try {
      await this.currentUser.delete();
    }
    catch (e) {
      this.onAuthError(e);
    }
  }


}
