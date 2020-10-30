import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import {Rent, RentDoc, RentStatus} from '../models/Rent';
import {AuthService} from './auth.service';
import {CloudFunctions} from '../../FirebaseCloudFunctions';

@Injectable({
  providedIn: 'root'
})
export class RentService {

  readonly rentsRef = firebase.firestore().collection('rents');

  constructor(
    private authService: AuthService,
  ) {}

  getNewRefId() : string {
    return this.rentsRef.doc().id;
  }

  async getRentDoc(id: string) : Promise<RentDoc> {
    return (await this.rentsRef.doc(id).get()).data() as RentDoc;
  }

  async getMyRents() : Promise<Rent[]> {
    const snapshot = await this.rentsRef
      .where('renterId', '==', this.authService.currentUser.uid)
      .orderBy('timestamp', 'desc')
      .get();
    return snapshot.docs.map((doc) => new Rent (doc.data() as RentDoc));
  }

  // Get the current rent document of the given dress
  // If the dress is not rented (or not exist), return null
  async getMyDressActiveRentDoc(dressId) : Promise<Rent | null> {
    try {
      const snapshot = await this.rentsRef
        .where('ownerId', '==', this.authService.currentUser.uid)
        .where('dressId', '==', dressId)
        .where('status', '>', RentStatus.PAST)
        .limit(1).get();
      if(!snapshot.empty) {
        const data = snapshot.docs[0].data() as RentDoc;
        return new Rent(data);
      }
      else
        return null;
    }
    catch (e) {
      console.error(e);
    }
  }

  async declareReturned(rentId: string) : Promise<boolean> {
    try {
      await CloudFunctions.approveDressBack(rentId);
      return true;
    }
    catch (e) {
      console.error(e);
      return false;
    }
  }

}
