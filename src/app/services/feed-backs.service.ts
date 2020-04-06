import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import {FeedBack} from '../models/Feedback';
import {AuthService} from './auth.service';

/**
 * This service response on reading and writing feed backs
 */

@Injectable({
  providedIn: 'root'
})
export class FeedBacksService {

  /** Get user's feed backs collection reference */
  private userFeedBacks = (uid: string) => this.authService.userProfileDoc(uid).collection('feedbacks');


  constructor(private authService: AuthService) {}


  /** Get some user's (including current user) feed backs */
  async getUserFeedBacks(uid: string, limit? : number) : Promise<FeedBack[]> {

    // Sort feed backs from latest to earliest
    let ref = this.userFeedBacks(uid).orderBy('timestamp', 'desc');

    // Limit number of feed backs to show, if specified
    if(limit)
      ref = ref.limit(limit);

    try {
      return (await ref.get()).docs.map((d)=>d.data() as FeedBack);
    }
    catch (e) {
      console.error(e);
    }

  }


  /** Write feed back to other user */
  async writeUserFeedBack(to: string, feedBack: FeedBack) : Promise<void> {

    // From current user UID
    feedBack.from = this.authService.currentUser.uid;

    // Write or edit feed back
    try {
      await this.userFeedBacks(to).doc(feedBack.from).set({
        ...feedBack,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});
    }
    catch (e) {
      console.error(e);
    }

  }

}
