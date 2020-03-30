import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import {FirebaseError, User, UserInfo} from 'firebase';
import {NavController, Platform} from '@ionic/angular';
import UserCredential = firebase.auth.UserCredential;
import {ActivatedRoute} from '@angular/router';


/** User's app data. It extends the basic firebase user info */
export interface UserDoc extends UserInfo {
  address?: string;
  city?: string;
  state?: string;
  size?: string;
}

/**
 * This service is used for signing-in users in different methods.
 * When a new user is created, it creates a document with his details in the users collection in firestore.
 *
 * This service includes signing up with providers (google\facebook) or with email & password, reset password & deleting user.
 *
 * @User_document: For providers, the document is being created in firestore immediately after connection. For email + password, the document is being
 * created only after entering with email verification link.
 *
 * @Email_verification: Since some providers (like facebook) are not considered as email verifiers, and since the email verification check
 * does not work in the firestore rules, I decided to ignore the email verification property, and instead check the existence of user's
 * document.
 *
 * @Deleting_user: A cloud function that handles the user's data deletion should be deployed
 *
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

  /** The firebase current user entity */
  private _user: User;

  /** Current user's document. Null if there is no signed-in user */
  private _currentUserDoc: UserDoc;

  /** User's document subscription. Used to unsubscribe document when user is being changed */
  private myProfileSubscription : ()=>void;

  /** A reference to firestore collection that contains all users data */
  private readonly USERS_COLLECTION = firebase.firestore().collection('users');

  /** Get a reference to some user's document (if UID not provided, get current user) */
  public userProfileDoc = (uid?: string) => this.USERS_COLLECTION.doc(uid || this._user.uid);

  /** The params that was read from the URL (email verification, reset password...) */
  private _mode: string;
  private _oobCode: string;
  private _emailFromURL: string;

  /** A function to invoke when there is an error */
  public onAuthError : (e: FirebaseError)=>void = e =>console.error(e);

  /** Regular expresion for password (alphanumeric + underscore, minimum 6 chars) */
  public passwordRegex = '^[a-zA-Z0-9_]{6,}$';

  /** Regular expresion for email address */
  public emailRegex = '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$';


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

      if(user) {

        // Subscribe the current user to its document changes.
        try {
          this.myProfileSubscription = this.userProfileDoc(user.uid).onSnapshot(snapshot => {

            this._currentUserDoc = snapshot.data() as UserDoc;

            // Navigate to login page or into the app
            if(this._currentUserDoc)
              this.navCtrl.navigateRoot(this.HOME_PAGE);
            else
              this.navCtrl.navigateRoot(this.LOGIN_PAGE);

          });
        }
        catch(e) {
          this.onAuthError(e);
        }

      }

      else
        this._currentUserDoc = null;

    });

  }


  get mode() : string {
    return this._mode;
  }

  get emailFromURL() : string {
    return this._emailFromURL;
  }


  /** Get the current user document (null if no signed in user or document does not exist) */
  get currentUser(): UserDoc | null {
    return this._currentUserDoc ? {...this._currentUserDoc} : null;
  }


  /** Check URL for reset password or email verification */
  private checkURL() {

    this.activatedRoute.queryParams.subscribe(async (params)=>{

      this._mode = params['mode'];

      if(this._mode) {
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
                await this._user.reload();
                await this.createUserDocument(this._user);
                this.navCtrl.navigateRoot(this.HOME_PAGE);
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
  async signUpWithEmail(email: string, password: string, name?: string, photo?: string) : Promise<UserCredential> {

    try {

      // Create new user with email & password
      const cred = await this.auth.createUserWithEmailAndPassword(email, password);

      // Send verification email
      await this.sendEmailVerification();

      // Set basic details
      await cred.user.updateProfile({displayName: name || null, photoURL: photo || null});

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

      // On the first sign-in, create user document
      if(cred.additionalUserInfo.isNewUser)
        await this.createUserDocument(cred.user);

      return cred;

    }
    catch (e) {
      this.onAuthError(e);
    }

  }


  // Create user document only from user valid properties
  private async createUserDocument(user: User) {

    const doc: UserInfo = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      providerId: user.providerId,
    };

    // Delete all undefined
    for(let p in user)
      if(!user[p])
        delete user[p];

    await this.userProfileDoc(user.uid).set(doc);

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
        this._oobCode = null;
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
      await this._user.delete();
    }
    catch (e) {
      this.onAuthError(e);
    }
  }


}
