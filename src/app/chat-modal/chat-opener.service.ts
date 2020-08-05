import { Injectable } from '@angular/core';
import {ChatModal} from './chat-modal.component';
import {ModalController} from '@ionic/angular';
import {ComponentsModule} from '../components/components.module';

@Injectable({
  providedIn: ComponentsModule
})
export class ChatOpenerService {

  constructor(private modalCtrl: ModalController) { }

  async openChat(withUid: string) {
    if(withUid) {
      const m = await this.modalCtrl.create({
        component: ChatModal,
        componentProps: {uid: withUid},
        backdropDismiss: false,
      });
      m.present();
    }
  }

}
