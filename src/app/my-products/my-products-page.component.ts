import {Component, OnInit} from '@angular/core';
import {Dress, DressStatus} from '../models/Dress';
import {DressesService} from '../services/dresses.service';
import {AlertsService} from '../services/Alerts.service';
import {NavigationService} from '../services/navigation.service';
import {DressEditorService} from '../services/dress-editor.service';

@Component({
  selector: 'app-uploads',
  templateUrl: './my-products-page.component.html',
  styleUrls: ['./my-products-page.component.scss'],
})
export class MyProductsPage implements OnInit {

  DressStatus = DressStatus;

  constructor(
    public dressesService: DressesService,
    private dressEditor: DressEditorService,
    private alertsService: AlertsService,
    private navService: NavigationService,
  ) { }

  ngOnInit() {
  }

  goToGalleryMode() {
    this.navService.myProducts(true);
  }

  goToDressUpload(dressId: string) {
    this.navService.editDress(dressId);
  }

  async publish(dress: Dress) {
    if(dress.publishValid) {
      await this.dressEditor.saveDress(dress.exportProperties(), true);
      this.alertsService.notice('Dress was published!')
    }
    else
      if(await this.alertsService.areYouSure('Cannot publish', "Some of the dress's properties are missing or invalid", 'Edit dress', 'Dismiss'))
        this.goToDressUpload(dress.id)
  }

}
