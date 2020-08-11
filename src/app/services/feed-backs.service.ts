import { Injectable } from '@angular/core';
import {FeedBack} from '../models/Feedback';
import {UserDataService} from './user-data.service';
import {DressesService} from './dresses.service';

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


  /** Get some user's (including current user) feed backs */
  async getFeedBacks(id: string, limit? : number, userOrDress: 'user' | 'dress' = 'user') : Promise<FeedBack[]> {

    // Sort feed backs from latest to earliest
    const col = userOrDress == 'user' ? this.userFeedBacks(id) : this.dressFeedBacks(id);
    let ref = col.orderBy('timestamp', 'desc');

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
  async writeFeedBack(to: string, feedBack: FeedBack, userOrDress: 'user' | 'dress' = 'user') : Promise<void> {

    // From current user UID
    feedBack.writerId = this.userService.currentUser.uid;
    feedBack.writerName = this.userService.currentUser.displayName;
    feedBack.timestamp = Date.now();

    // Write or edit feed back
    try {
      const col = userOrDress == 'user' ? this.userFeedBacks(to) : this.dressFeedBacks(to);
      await col.doc(feedBack.writerId).set(feedBack);
    }
    catch (e) {
      console.error(e);
    }

  }

}
