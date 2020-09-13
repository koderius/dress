import { Injectable } from '@angular/core';
import {FeedBack} from '../models/Feedback';
import {UserDataService} from './user-data.service';
import {DressesService} from './dresses.service';
import {Observable} from 'rxjs';

/**
 * This service response on reading and writing feed backs
 */

@Injectable({
  providedIn: 'root'
})
export class FeedBacksService {

  /** Get user's feed backs collection reference */
  private userFeedBacks = (uid: string) => this.userService.userDocRef(uid).collection('feedbacks');
  private dressFeedBacks = (dressId: string) => this.dressService.dressesRef.doc(dressId).collection('feedbacks');


  constructor(
    private userService: UserDataService,
    private dressService: DressesService,
  ) {}


  /** Get some user's or dress's (including current user) feed backs */
  feedBacks$(userOrDress: 'user' | 'dress', id: string, limit? : number) : Observable<FeedBack[]> {

    // Sort feed backs from latest to earliest
    const col = userOrDress == 'user' ? this.userFeedBacks(id) : this.dressFeedBacks(id);
    let ref = col.orderBy('timestamp', 'desc');

    // Limit number of feed backs to show, if specified
    if(limit)
      ref = ref.limit(limit);

    try {
      return new Observable(subscriber => {
        subscriber.add(ref.onSnapshot(snapshot => {
          subscriber.next(snapshot.docs.map((d)=>d.data() as FeedBack));
        }));
      });
    }
    catch (e) {
      console.error(e);
    }

  }


  /** Get the feedback the user wrote about some dress or other user */
  async getMyFeedBack(userOrDress: 'user' | 'dress', id: string) : Promise<FeedBack> {
    const col = userOrDress == 'user' ? this.userFeedBacks(id) : this.dressFeedBacks(id);
    const snapshot = await col.doc(this.userService.currentUser.uid).get();
    return snapshot.exists ? snapshot.data() as FeedBack : {};
  }


  /** Write feed back to other user */
  // TODO: Limit the time period of writing/editing the review
  async writeFeedBack(to: string, feedBack: FeedBack, userOrDress: 'user' | 'dress' = 'user') : Promise<boolean> {

    // From current user UID
    feedBack.writerId = this.userService.currentUser.uid;
    feedBack.writerName = this.userService.currentUser.displayName;
    feedBack.timestamp = Date.now();

    // Write or edit feed back
    try {
      const col = userOrDress == 'user' ? this.userFeedBacks(to) : this.dressFeedBacks(to);
      await col.doc(feedBack.writerId).set(feedBack);
      return true;
    }
    catch (e) {
      console.error(e);
    }

  }

}
