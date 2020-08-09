import {Injectable} from '@angular/core';
import {AuthService} from './auth.service';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import DocumentSnapshot = firebase.firestore.DocumentSnapshot;
import {AlertsService} from './Alerts.service';
import {FirebaseError, User} from 'firebase';
import {UserDoc} from '../models/User';
import {Observable} from 'rxjs';
import {TermsComponent} from '../components/terms/terms.component';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  public userDocRef(uid: string = this._currentUser && this._currentUser.uid) {
    if(uid)
      return firebase.firestore().collection('users').doc(uid);
  }

  private unsubFn: ()=>void;

  private _currentUser: UserDoc | null;

  get currentUser() : UserDoc | null {
    return this._currentUser;
  }

  /** Observe the (verified) user document */
  onUserDoc = new Observable<UserDoc | null>(subscriber => {
    subscriber.add(this.authService.user$.subscribe((user: User)=>{
      if(this.unsubFn)
        this.unsubFn();

      if(user && user.emailVerified) {
        this.unsubFn = this.userDocRef(user.uid).onSnapshot(async (snapshot: DocumentSnapshot<UserDoc>) => {
          if(snapshot.exists)
            this._currentUser = snapshot.data();
          else {
            this._currentUser = await this.createUserDocument();
          }
          subscriber.next(this._currentUser);
        }, (e: FirebaseError) => this.errorMsg(e));
      }
      else
        subscriber.next(null);
    }));
  });

  constructor(
    private alertService: AlertsService,
    private authService: AuthService,
  ) {}

  /*
  Get user document according to provided UID.
  If UID is not provided, or same as logged user ID, get the current user.
  */
  async getUserDoc(uid?: string) : Promise<UserDoc | null> {
    if((this._currentUser && this._currentUser.uid == uid) || !uid)
      return this._currentUser;
    else {
      const snapshot: DocumentSnapshot<UserDoc> | void = await this.userDocRef(uid).get()
        .catch((e: FirebaseError) => this.errorMsg(e));
      return snapshot ? snapshot.data() : null;
    }
  }


  /** Update user's document */
  async editUserDocument(newUserDetails: Partial<UserDoc>) : Promise<void> {

    // Properties that cannot be changed:
    delete newUserDetails.uid;
    delete newUserDetails.email;
    delete newUserDetails.rank;

    try {
      // Set the user's document with the new data - in the auth module and in the document
      if(await this.authService.updateUserData(newUserDetails)) {
        await this.userDocRef().update(newUserDetails);
      }
    }
    catch (e) {
      this.errorMsg(e);
    }

  }

  private async createUserDocument() {

    const user = this.authService.currentUser;

    const doc: UserDoc = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      fullName: user.displayName,
    };

    // Delete all undefined
    for(let p in user)
      if(!user[p])
        delete user[p];

    try {
      await this.userDocRef(user.uid).set(doc);
      return doc;
    }
    catch (e) {
      this.errorMsg(e);
      return null;
    }

  }

  private errorMsg(e: FirebaseError) {
    console.error(e);
    this.alertService.notice('Could not load user data', 'Error', `${e.code}\n${e.message}`);
  }

}
