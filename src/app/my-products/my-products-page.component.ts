import {Component, OnInit} from '@angular/core';
import {Dress, DressStatus} from '../models/Dress';
import {DressesService} from '../services/dresses.service';
import {AlertsService} from '../services/Alerts.service';
import {NavigationService} from '../services/navigation.service';

@Component({
  selector: 'app-uploads',
  templateUrl: './my-products-page.component.html',
  styleUrls: ['./my-products-page.component.scss'],
})
export class MyProductsPage implements OnInit {

  DressStatus = DressStatus;

  myDresses: Dress[] = [];
  myDrafts: Dress[] = [];

  segment: string;

  constructor(
    private dressesService: DressesService,
    private alertsService: AlertsService,
    private navService: NavigationService,
  ) { }

  async ngOnInit() {
    try {

      // Get all user's dresses and separate them into drafts and published
      const dresses = await this.dressesService.getMyDresses();
      dresses.forEach((d)=>{
        (d.status == DressStatus.DRAFT ? this.myDrafts : this.myDresses).push(d);
      });

    }
    catch (e) {
      this.alertsService.notice('Could not get your data...', 'Error', e)
    }
  }

  goToDressUpload(dressId: string) {
    this.navService.editDress(dressId);
  }

}
