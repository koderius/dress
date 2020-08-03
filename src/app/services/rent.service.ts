import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import {Rent, RentDoc, RentStatus} from '../models/Rent';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RentService {

  readonly rentsRef = firebase.firestore().collection('rents');

  constructor(
    private authService: AuthService,
  ) {}

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

}
