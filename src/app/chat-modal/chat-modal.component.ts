import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ChatService} from '../services/chat.service';
import {Subscription} from 'rxjs';
import {UserDoc} from '../services/auth.service';
import {IonContent, ModalController} from '@ionic/angular';
import {ChatMsg} from '../models/ChatMsg';
import {UserDataService} from '../services/user-data.service';

@Component({
  selector: 'app-chat-modal',
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.scss'],
})
export class ChatModal implements OnInit, OnDestroy {

  @ViewChild('content', {static: false}) content: IonContent;
  @ViewChild('unreadFromHere', {static: false}) unreadMsg: ElementRef;

  @Input() uid: string;

  msgSub: Subscription;

  partner: UserDoc;

  myMsg: string = '';

  myName: string;

  lastRead: number;
  canScrollToBottom: boolean;

  get messages() {
    return this.chatService.messages;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    public chatService: ChatService,
    private modalCtrl: ModalController,
    private userService: UserDataService,
  ) { }

  async ngOnInit() {

    if(this.uid != this.userService.currentUser.uid) {
      this.myName = this.userService.currentUser.displayName;
      this.partner = await this.userService.getUserDoc(this.uid);
      if(this.partner) {
        await this.chatService.enterConversation(this.uid);
        // Scroll to the last read message
        this.lastRead = this.chatService.meta.lastRead;
        setTimeout(()=>{
          if(this.unreadMsg && this.unreadMsg.nativeElement)
            this.content.scrollToPoint(0, this.unreadMsg.nativeElement.offsetTop);
        }, 500);
      }
    }

    this.msgSub = this.chatService.onMsg.subscribe((msg: ChatMsg)=>{
      if(this.canScrollToBottom)
        this.content.scrollToBottom();
    });

  }

  ngOnDestroy(): void {
    this.chatService.leaveConversation();
    this.msgSub.unsubscribe();
  }

  msgTimeFormat(time: number) {
    const d = new Date(time);
    if(d.toDateString() == new Date().toDateString())
      return 'HH:mm';
    else
      return 'dd/MM/yy HH:mm';
  }

  send() {
    if(this.myMsg.trim()) {
      this.chatService.writeMsg(this.myMsg);
      this.myMsg = '';
      this.canScrollToBottom = true;
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

}
