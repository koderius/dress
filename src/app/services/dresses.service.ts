import { Injectable } from '@angular/core';
import {Dress, DressProps} from '../models/Dress';
import * as firebase from 'firebase';
import 'firebase/firestore';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DressesService {

  /** Reference to all users dresses sub-collections (not including drafts) */
  private readonly DRESSES_COLLECTION = firebase.firestore().collectionGroup('dresses').where('status', '>', 0);

  private _dresses : DressProps[] = [];

  get dresses() {
    return this._dresses.map((d)=>new Dress(d));
  }


  constructor(private authService: AuthService) {

    /** MOCK */
    for (let i = 0; i < 4; i++)
      this._dresses[i] ={
        id: 'd'+i,
        category: 'c1',
        ranks: [132,43,123,563,123],
        price: 230,
        datesRange: [new Date(), new Date(Date.now() + 12345678)],
        state: 'Israel',
        photos: ['../../assets/MOCKs/dress.PNG'],
      };

    // // Subscribe all dresses TODO: Only for develop - should be filtered
    // this.DRESSES_COLLECTION.onSnapshot(snapshot => {
    //   this._dresses = snapshot.docs.map((d)=>d.data() as DressProps);
    // });

  }

}
