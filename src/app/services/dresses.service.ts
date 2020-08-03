import {Injectable} from '@angular/core';
import {Dress, DressProps, DressStatus} from '../models/Dress';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import {AuthService} from './auth.service';
import {AlertsService} from './Alerts.service';

@Injectable({
  providedIn: 'root'
})
export class DressesService {

  readonly dressesRef = firebase.firestore().collection('dresses');

  /** Reference to all non-draft dresses collections */
  private readonly publicDressesRef = this.dressesRef.where('status', '>', 0);

  private _dresses : DressProps[] = [];

  // All my dresses, split into drafts & non-drafts
  private _myDresses: DressProps[] = [];
  drafts: Dress[] = [];
  nonDrafts: Dress[] = [];

  private myDressesUnsubscribeFn: ()=>void;

  get dresses() {
    return this._dresses.map((d)=>new Dress(d));
  }

  get myDresses() {
    return this._myDresses.map((d)=>new Dress(d));
  }


  constructor(
    private authService: AuthService,
    private alertsService: AlertsService,
  ) {

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

    this.authService.user$.subscribe((user)=>{

      // Unsubscribe previous user dresses
      if(this.myDressesUnsubscribeFn)
        this.myDressesUnsubscribeFn();

      this._myDresses.splice(0);

      // Start subscribing current user dresses
      if(user) {
        try {
          this.myDressesUnsubscribeFn = this.dressesRef.where('owner', '==', user.uid)
            .onSnapshot((snapshot)=>{
              this._myDresses = snapshot.docs.map((d)=>d.data() as DressProps);
              // Split
              this.drafts.splice(0);
              this.nonDrafts.splice(0);
              this._myDresses.forEach((d)=>{
                (d.status == DressStatus.DRAFT ? this.drafts : this.nonDrafts).push(new Dress(d));
              });
            });
        }
        catch (e) {
          this.alertsService.notice('Could not get your data...', 'Error', e)
        }
      }

    });

  }

}
