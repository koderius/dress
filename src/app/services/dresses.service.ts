import { Injectable } from '@angular/core';
import {Dress, DressProps} from '../models/Dress';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DressesService {

  readonly dressesRef = firebase.firestore().collection('dresses');

  /** Reference to all non-draft dresses collections */
  private readonly publicDressesRef = this.dressesRef.where('status', '>', 0);

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
        datesRange: [Date.now(), Date.now() + 12345678],
        state: 'Israel',
        photos: ['../../assets/MOCKs/dress.PNG'],
      };

    // // Subscribe all dresses TODO: Only for develop - should be filtered
    // this.DRESSES_COLLECTION.onSnapshot(snapshot => {
    //   this._dresses = snapshot.docs.map((d)=>d.data() as DressProps);
    // });

  }

  // Get all the user's dresses
  async getMyDresses() {
    const snapshot = await this.dressesRef.where('owner', '==', this.authService.currentUser.uid).get();
    return snapshot.docs
      .map((d)=>d.data() as DressProps)
      .map((props)=>new Dress(props));
  }

}
