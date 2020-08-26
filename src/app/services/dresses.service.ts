import {Injectable} from '@angular/core';
import {Dress, DressProps, DressStatus} from '../models/Dress';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import {AlertsService} from './Alerts.service';
import {UserDataService} from './user-data.service';
import {SearchFilters} from '../models/SearchFilters';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DressesService {

  readonly dressesRef = firebase.firestore().collection('dresses');

  /** Reference to all non-draft dresses collections ordered by rank */
  private readonly publicDressesRef = this.dressesRef
    .where('status', '==', DressStatus.OPEN)
    .orderBy('rank', 'desc');

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
    private userService: UserDataService,
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
        country: 'Israel',
        photos: ['../../assets/MOCKs/dress.PNG'],
      };


    // Start subscribing all my dresses
    this.userService.userDoc$.subscribe((user)=>{

      // Unsubscribe previous user dresses
      if(this.myDressesUnsubscribeFn)
        this.myDressesUnsubscribeFn();

      this._myDresses.splice(0);

      // Start subscribing current user dresses
      if(user) {
        try {
          this.myDressesUnsubscribeFn = this.dressesRef
            .where('owner', '==', user.uid).onSnapshot((snapshot)=>{
              this._myDresses = snapshot.docs
                .map((d)=>d.data() as DressProps)
                .sort((a, b) => a.name.localeCompare(b.name));
              // Split
              this.drafts.splice(0);
              this.nonDrafts.splice(0);
              this._myDresses.forEach((d)=>{
                const list = d.status == DressStatus.DRAFT ? this.drafts : this.nonDrafts;
                list.push(new Dress(d));
              });
            });
        }
        catch (e) {
          this.alertsService.notice('Could not get your data...', 'Error', e)
        }
      }

    });

  }


  // Load single dress
  async loadDress(id: string) : Promise<Dress> {
    try {
      const snapshot = await this.dressesRef.doc(id).get();
      return new Dress(snapshot.data() as DressProps);
    }
    catch (e) {
      this.alertsService.notice('Could not find dress', 'Error');
      console.error(e);
    }
  }


  // Load dresses of some user todo: ordered by?
  async loadDressesOfUser(uid: string, limit?: number) : Promise<Dress[]> {
    let ref = this.publicDressesRef.where('owner', '==', uid);
    if(limit)
      ref = ref.limit(limit);
    const snapshot = await ref.get();
    return snapshot.docs.map((d)=>new Dress(d.data() as DressProps));
  }


  // Get an observable of the most popular
  mostPopular$(limit?: number) : Observable<Dress[]> {

    let ref = this.publicDressesRef;
    if(limit)
      ref = ref.limit(limit);

    return new Observable<Dress[]>(subscriber => {
      const unSub = ref.onSnapshot(snapshot => {
          const dresses = snapshot.docs.map((d)=>new Dress(d.data() as DressProps));
          subscriber.next(dresses);
        },
        (e)=>this.alertsService.notice('Cannot load dresses', 'Error', `${e.name}/${e.message}`)
      );
      subscriber.add(unSub);
    });

  }


  async filterDresses(searchFilters: SearchFilters) {

    let ref = this.publicDressesRef;

    // Filter by the first category
    if(searchFilters.categories.length)
      ref = ref.where('category', '==', searchFilters.categories.splice(0,1)[0]);

    // Filter by the first country
    if(searchFilters.countries.length)
      ref = ref.where('country', '==', searchFilters.countries.splice(0,1)[0]);

    // Filter by available dates? - todo

    const res = await ref.get();
    let dresses = res.docs.map((d)=>d.data()) as DressProps[];

    // Filter the rest of the categories & countries in the front end
    if(searchFilters.categories.length)
      dresses = dresses.filter((d)=>searchFilters.categories.slice(10).includes(d.category));
    if(searchFilters.countries.length)
      dresses = dresses.filter((d)=>searchFilters.countries.slice(10).includes(d.country));
    // More fields (advanced)? - todo

    return dresses.map((d)=>new Dress(d));

  }

}
