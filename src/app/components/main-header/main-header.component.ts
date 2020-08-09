import { Component, OnInit } from '@angular/core';
import {UserDataService} from '../../services/user-data.service';
import {PopoverController} from '@ionic/angular';
import {NotificationsComponent} from '../notifications/notifications.component';
import {ChatService} from '../../services/chat.service';

@Component({
  selector: 'app-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent implements OnInit {

  constructor(
    public userService: UserDataService,
    private popoverCtrl: PopoverController,
    private chatService: ChatService,
  ) { }

  ngOnInit() {}

  get chatsLoaded() : boolean {
    return !!this.chatService.lastChats;
  }

  get hasNotes() : boolean {
    return this.chatsLoaded && this.chatService.lastChats.some((lc)=>lc && lc.unread);
  }

  async openNotes(ev: MouseEvent) {
    const p = await this.popoverCtrl.create({
      component: NotificationsComponent,
      event: ev,
    });
    p.present();
  }

}
