import { Component, OnInit } from '@angular/core';
import {ChatService} from '../../services/chat.service';
import {ChatPreview} from '../../models/ChatMsg';
import {UserDataService} from '../../services/user-data.service';
import {ChatOpenerService} from '../../chat-modal/chat-opener.service';
import {PopoverController} from '@ionic/angular';
import {DefaultUserImage} from '../../Utils/Images';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {

  DefaultUserImage = DefaultUserImage;

  cons: ChatPreview[] = [];

  constructor(
    private chatService: ChatService,
    public userService: UserDataService,
    private chatOpener: ChatOpenerService,
    private popoverCtrl: PopoverController,
  ) { }

  async ngOnInit() {
    this.cons = this.chatService.lastChats;
  }

  goToChat(uid: string) {
    this.chatOpener.openChat(uid);
    this.popoverCtrl.dismiss();
  }

}
