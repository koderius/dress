import {Injectable} from '@angular/core';
import {NavController} from '@ionic/angular';
import {Dress, DressProps, DressStatus} from '../models/Dress';
import {DressesService} from '../services/dresses.service';
import {AlertsService} from '../services/Alerts.service';
import {UserDoc} from '../models/User';
import {UserDataService} from '../services/user-data.service';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  private _dressToRent: DressProps;
  get dressToRent() : Dress {
    return this._dressToRent ? new Dress(this._dressToRent) : null;
  }

  private _owner: UserDoc;
  get owner() {
    return {...this._owner};
  }

  constructor(
    private navCtrl: NavController,
    private dressService: DressesService,
    private alertService: AlertsService,
    private userService: UserDataService,
  ) { }

  async startPurchaseProcess(dressId: string) {
    const dress = await this.dressService.loadDress(dressId);
    if(dress && dress.status == DressStatus.OPEN) {
      this._dressToRent = dress;
      this._owner = await this.userService.getUserDoc(this._dressToRent.owner);
      if(this._owner)
        this.navCtrl.navigateRoot('tabs/purchase');
      else
        this.alertService.notice('Dress owner was not found', 'Error');
    }
    else
      this.alertService.notice('Dress is not available', 'Error', dress ? 'The dress is currently rented' : 'Dress was not found');
  }

  stopPurchase() {
    this._dressToRent = null;
  }

}
