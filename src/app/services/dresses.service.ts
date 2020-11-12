import {Injectable} from '@angular/core';
import {Dress, DressProps, DressStatus} from '../models/Dress';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import {AlertsService} from './Alerts.service';
import {UserDataService} from './user-data.service';
import {SearchFilters} from '../models/SearchFilters';
import {Observable} from 'rxjs';
import {Colors} from '../Utils/Colors';

@Injectable({
  providedIn: 'root'
})
export class DressesService {

  readonly dressesRef = firebase.firestore().collection('dresses');

  /** Reference to all non-draft dresses collections ordered by rank */
  private readonly publicDressesRef = this.dressesRef
    .where('status', '==', DressStatus.OPEN)
    .orderBy('rank', 'desc');

  // All my dresses, split into drafts & non-drafts
  private _myDresses: DressProps[] = [];
  drafts: Dress[] = [];
  nonDrafts: Dress[] = [];

  private myDressesUnsubscribeFn: ()=>void;

  get myDresses() {
    return this._myDresses.map((d)=>new Dress(d));
  }

  constructor(
    private userService: UserDataService,
    private alertsService: AlertsService,
  ) {

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
      const props = (await this.dressesRef.doc(id).get()).data();
      return new Dress(props);
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

    // Filter by countries (if less than 10)
    if(searchFilters.countries.length && searchFilters.countries.length <= 10)
      ref = ref.where('country', 'in', searchFilters.countries);

    // Or filter by categories
    else if(searchFilters.categories.length && searchFilters.categories.length <= 10)
      ref = ref.where('category', 'in', searchFilters.categories);

    const res = await ref.get();
    let dresses = res.docs.map((d)=>d.data()) as DressProps[];

    // Filter the categories & countries in the front end (in case not all filters were queried)
    if(searchFilters.categories.length)
      dresses = dresses.filter((d)=>searchFilters.categories.includes(d.category));
    if(searchFilters.countries.length)
      dresses = dresses.filter((d)=>searchFilters.countries.includes(d.country));

    // Filter by date // TODO: Filter in query
    if(searchFilters.fromDate)
      // Filter "from date" is inside the dress range
      dresses = dresses.filter(d => d.datesRange[0] <= +searchFilters.fromDate && d.datesRange[1] >= +searchFilters.fromDate);
    if(searchFilters.toDate)
      // Filter "to date" is inside the dress range
      dresses = dresses.filter(d => d.datesRange[0] <= +searchFilters.toDate && d.datesRange[1] >= +searchFilters.toDate);

    // More fields (advanced)
    if(searchFilters.size.length)
      dresses = dresses.filter(d => searchFilters.size.includes(d.size));
    if(searchFilters.style)
      dresses = dresses.filter(d => d.style.toLowerCase().includes(searchFilters.style.toLowerCase()));
    if(searchFilters.fromPrice)
      dresses = dresses.filter(d => d.price >= searchFilters.fromPrice);
    if(searchFilters.toPrice)
      dresses = dresses.filter(d => d.price <= searchFilters.toPrice);
    if(searchFilters.color)
      dresses = dresses.filter(d => Colors.IsSimilar(d.color, searchFilters.color));

    return dresses.map((d)=>new Dress(d));

  }

}
