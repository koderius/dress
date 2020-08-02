import { Injectable } from '@angular/core';
import {ActionSheetController, PopoverController} from '@ionic/angular';
import {PhotoPopoverComponent} from './photo-popover.component';
import {ComponentsModule} from '../components.module';

@Injectable({
  providedIn: ComponentsModule,
})
export class PhotoPopoverCtrlService {

  constructor(
    private popoverCtrl: PopoverController,
    private actionSheetCtrl: ActionSheetController,
  ) { }

  async showPhoto(photoUrl: string) {
    const p = await this.popoverCtrl.create({
      component: PhotoPopoverComponent,
      componentProps: {image: photoUrl},
      cssClass: 'photo-popover',
    });
    p.present();
  }

  async openActionSheet(photoUrl: string) {
    const a = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
        },
        {
          text: 'Preview',
          icon: 'image',
          handler: () => {
            this.showPhoto(photoUrl);
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
        }
      ]
    });
    await a.present();
    return await a.onDidDismiss();
  }

}
