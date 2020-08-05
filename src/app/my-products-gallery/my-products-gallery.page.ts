import { Component, OnInit } from '@angular/core';
import {DressesService} from '../services/dresses.service';
import {Dress, DressStatus} from '../models/Dress';
import {PhotoPopoverCtrlService} from '../components/photo-popover/photo-popover-ctrl.service';
import {NavigationService} from '../services/navigation.service';
import {DressEditorService} from '../services/dress-editor.service';
import {AlertsService} from '../services/Alerts.service';

@Component({
  selector: 'app-my-products-gallery',
  templateUrl: './my-products-gallery.page.html',
  styleUrls: ['./my-products-gallery.page.scss'],
})
export class MyProductsGalleryPage implements OnInit {

  DressStatus = DressStatus;

  constructor(
    public dressesService: DressesService,
    private dressEdit: DressEditorService,
    private photoPopover: PhotoPopoverCtrlService,
    private navService: NavigationService,
    private alertsService: AlertsService,
  ) { }

  ngOnInit() {
  }

  showPhotos(photoUrls: string[]) {
    this.photoPopover.openActionSheet(photoUrls, false);
  }

  goToDress(dressId: string) {
    this.navService.editDress(dressId);
  }

  goToDressView(dressId: string) {
    this.navService.dressView(dressId);
  }

  async deleteDress(dress: Dress, idx: number) {
    if(await this.alertsService.areYouSure(
      `Delete "${dress.name}" permanently?`,
      'You will NOT be able to recover the dress.',
      'Delete',
      'Cancel'
    ))
      await this.dressEdit.deleteDress(dress.id);
  }

}
