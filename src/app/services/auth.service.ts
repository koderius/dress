import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import 'firebase/auth';
import {FirebaseError, User, UserInfo} from 'firebase';
import {NavController, Platform} from '@ionic/angular';
import UserCredential = firebase.auth.UserCredential;
import {ActivatedRoute} from '@angular/router';
import {strictEqual} from 'assert';


/** User's app data. It extends the basic firebase user info */
export interface UserDoc extends UserInfo {
  address?: string;
  city?: string;
  state?: string;
  size?: string;
}

export enum AuthStatus {

  NO_USER = 0,

  RESET_PASSWORD_EMAIL_SENT = 41,
  ENTERED_WITH_RESET_PASSWORD_LINK = 42,

  EMAIL_NOT_VERIFIED = 90,

  AUTH_USER = 100,

}

/**
 * This service is used for signing-in users in different methods.
 * When a new user is created, it creates a document with his details in the users collection in firestore.
 */

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /** Page to navigate when there is no user */
  private readonly LOGIN_PAGE = 'landing';

  /** Page to navigate when user has signed-in */
  private readonly HOME_PAGE = 'tabs';

  /** Firebase auth module **/
  private auth = firebase.auth();

  /** The firebase user entity */
  private _user: User;

  /** Current user's document. Null if there is no signed-in user */
  private _currentUserDoc: UserDoc;

  /** User's document subscription. Used to unsubscribe document when user is being changed */
  private myProfileSubscription : ()=>void;

  /** A reference to firestore collection that contains all users data */
  private readonly USERS_COLLECTION = firebase.firestore().collection('users');

  /** Get a reference to some user's document (if UID not provided, get current user) */
  public userProfileDoc = (uid?: string) => this.USERS_COLLECTION.doc(uid || this._currentUserDoc.uid);

  /** The user authentication status (see enum) */
  private _authStatus: AuthStatus;

  /** A code that was read from the URL (email verification, reset password...) */
  private oobCode: string;

  /** The user's email which the URL sent to (email verification, reset password...) */
  private _emailFromURL: string;

  /** A function to invoke when there is an error */
  public onAuthError : (e: FirebaseError)=>void = e =>console.error(e);


  constructor(
    private platform : Platform,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
  ) {

    this.checkURL();

    // When user changes
    firebase.auth().onAuthStateChanged(async (user : User)=>{

      console.log(user);

      this._user = user;

      // Stop previous user's subscription, if there is
      if(this.myProfileSubscription)
        this.myProfileSubscription();

      // Subscribe the current user to its document changes
      if(user) {

        // If email is not verified, do not proceed
        // (Although the user is still signed-in, the user's document will not be set, and the app will not get the user data)
        if(!user.emailVerified) {
          this._authStatus = AuthStatus.EMAIL_NOT_VERIFIED;
          return;
        }

        this._authStatus = AuthStatus.AUTH_USER;

        try {
          this.myProfileSubscription = this.userProfileDoc(user.uid).onSnapshot(snapshot => {
            this._currentUserDoc = snapshot.data() as UserDoc;
          });
        }
        catch(e) {
          this.onAuthError(e);
        }

        this.navCtrl.navigateRoot(this.HOME_PAGE);

      }

      else {
        this._authStatus = AuthStatus.NO_USER;
        this._currentUserDoc = null;
        this.navCtrl.navigateRoot(this.LOGIN_PAGE);
      }

    });

  }


  get authStatus() : AuthStatus {
    return this._authStatus;
  }

  get emailFromURL() : string {
    return this._emailFromURL;
  }


  /** Get the current user info (null if no signed in user) */
  get currentUser(): UserDoc | null {
    return this._currentUserDoc;
  }


  /** Check URL for reset password or email verification */
  private checkURL() {

    this.activatedRoute.queryParams.subscribe(async (params)=>{

      if(params['mode']) {
        this.oobCode = params['oobCode'];
        try {
          switch (params['mode']) {

            case 'resetPassword':
              this._emailFromURL = await this.auth.verifyPasswordResetCode(this.oobCode);
              if(this._emailFromURL)
                this._authStatus = AuthStatus.ENTERED_WITH_RESET_PASSWORD_LINK;
              break;

            case 'verifyEmail':
              const info = await this.auth.checkActionCode(this.oobCode);
              if(info) {
                this._emailFromURL = info.data.email;
                await this.auth.applyActionCode(this.oobCode);
              }
              break;

          }
        }
        catch (e) {
          this.onAuthError(e);
        }
      }

    });
  }


  /** Sign up new users with email & password */
  async signUpWithEmail(email: string, password: string) : Promise<UserCredential> {

    try {

      // Create new user with email & password
      const cred = await this.auth.createUserWithEmailAndPassword(email, password);

      // Send verification email
      await this.sendEmailVerification();

      // Create user document with his email, UID and additional info
      await this.userProfileDoc(cred.user.uid).set({
        uid: cred.user.uid,
        email: email,
      });

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
      method = this.platform.is('mobile') ? 'redirect' : 'popup';

    try {

      // Use redirect or popup
      let cred: UserCredential;
      if(method == 'redirect') {
        await this.auth.signInWithRedirect(provider);
        cred = await this.auth.getRedirectResult();
      }
      if(method == 'popup')
        cred = await this.auth.signInWithPopup(provider);

      // On the first sign-in, create user document
      if(cred.additionalUserInfo.isNewUser) {
        const user = cred.user;
        await this.userProfileDoc(cred.user.uid).set({
          ...user,
          // TODO: Check cred.additionalUserInfo for additional info
          profile: cred.additionalUserInfo.profile,
        });
      }

      return cred;

    }
    catch (e) {
      this.onAuthError(e);
    }

  }


  /** Update user's document (MERGE) */
  async editUserDocument(newUserDetails: UserDoc) : Promise<void> {

    // Cannot change UID
    delete newUserDetails.uid;

    try {

      // Update the name & photo details in the firebase auth user (not so important)
      const fbProfile: {displayName?: string, photoURL?: string} = {};
      if(newUserDetails.displayName)
        fbProfile.displayName = newUserDetails.displayName;
      if(newUserDetails.photoURL)
        fbProfile.photoURL = newUserDetails.photoURL;
      this._user.updateProfile(fbProfile);

      // Set the user's document with the new data
      await this.userProfileDoc().set({
        ...newUserDetails
      }, {merge: true});

    }
    catch (e) {
      this.onAuthError(e);
    }

  }


  /** Send the user an email with verification link */
  async sendEmailVerification() {
    try {
      await this._user.sendEmailVerification();
    }
    catch (e) {
      this.onAuthError(e);
    }
  }


  /** Send reset password email */
  async sendResetPasswordEmail(email: string) {
    try {
      await this.auth.sendPasswordResetEmail(email);
      this._authStatus = AuthStatus.RESET_PASSWORD_EMAIL_SENT;
    }
    catch (e) {
      this.onAuthError(e);
    }
  }


  /** Reset the password after entering the app through the reset password link */
  async resetPassword(newPassword: string) : Promise<void> {
    try {
      if(this.oobCode) {
        await this.auth.confirmPasswordReset(this.oobCode, newPassword);
        this.oobCode = null;
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
      await this._user.delete();
    }
    catch (e) {
      this.onAuthError(e);
    }
  }


}
