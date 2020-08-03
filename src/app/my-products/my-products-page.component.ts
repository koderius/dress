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
    await this.dressEditor.saveDress(dress.exportProperties(), true);
  }

}
