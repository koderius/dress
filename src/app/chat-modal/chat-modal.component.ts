import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ChatService} from '../services/chat.service';
import {Subscription} from 'rxjs';
import {UserDoc} from '../services/auth.service';
import {IonContent, ModalController, Platform} from '@ionic/angular';
import {ChatMsg} from '../models/ChatMsg';
import {UserDataService} from '../services/user-data.service';
import {Dress} from '../models/Dress';

@Component({
  selector: 'app-chat-modal',
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.scss'],
})
export class ChatModal implements OnInit, OnDestroy {

  @ViewChild('content', {static: false}) content: IonContent;
  @ViewChild('unreadFromHere', {static: false}) unreadMsg: ElementRef<HTMLDivElement>;
  @ViewChild('lastMsg', {static: false}) lastMsg: ElementRef<HTMLDivElement>;

  @Input() uid: string;
  @Input() dressInterested: Dress;

  msgSub: Subscription;

  partner: UserDoc;

  myMsg: string = '';

  myName: string;

  lastRead: number;

  messages = [];

  isLastMsgSeen: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    public chatService: ChatService,
    private modalCtrl: ModalController,
    private userService: UserDataService,
    private platform: Platform,
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

    const startTime = Date.now();

    // Subscribe messages
    this.msgSub = this.chatService.onMessage.subscribe((msg: ChatMsg)=>{
      this.messages.push(msg);
      // Sort old messages by time
      if(msg.timestamp < startTime)
        this.messages.sort((a, b) => a.timestamp - b.timestamp);
      // If scroll is on the bottom, keep scroll bottom with every new message
      if(this.isLastMsgSeen)
        this.content.scrollToBottom(500);
    });

  }

  ngOnDestroy(): void {
    this.chatService.leaveConversation();
    this.msgSub.unsubscribe();
  }

  onScroll() {
    const lastMsgTop = this.lastMsg.nativeElement.getBoundingClientRect().top;
    this.isLastMsgSeen = lastMsgTop < this.platform.height() - 100;
  }

  msgTimeFormat(time: number) {
    const d = new Date(time);
    if(d.toDateString() == new Date().toDateString())
      return 'HH:mm';
    else
      return 'dd/MM/yy HH:mm';
  }

  async send() {
    if(this.dressInterested) {
      await this.chatService.writeMsg(this.dressInterested.exportProperties());
      this.dressInterested = null;
    }
    if(this.myMsg.trim()) {
      this.chatService.writeMsg(this.myMsg);
      this.myMsg = '';
      if(!this.isLastMsgSeen)
        this.content.scrollToBottom(500);
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

}
