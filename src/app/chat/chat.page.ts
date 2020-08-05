import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ChatService} from '../services/chat.service';
import {Subscription} from 'rxjs';
import {AuthService, UserDoc} from '../services/auth.service';
import {IonContent} from '@ionic/angular';
import {ChatMsg} from '../models/ChatMsg';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy {

  @ViewChild('content', {static: false}) content: IonContent;
  @ViewChild('unreadFromHere', {static: false}) unreadMsg: ElementRef;

  sub: Subscription;
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
    private chatService: ChatService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.sub = this.activatedRoute.params.subscribe(async (params)=>{
      const uid = params['uid'];
      if(uid != this.authService.currentUser.uid) {
        this.myName = this.authService.currentUser.displayName;

        this.partner = await this.authService.getUserDoc(uid);
        if(this.partner) {

          await this.chatService.enterConversation(uid);

          // Scroll to the last read message
          this.lastRead = this.chatService.meta.lastRead;
          setTimeout(()=>{
            if(this.unreadMsg && this.unreadMsg.nativeElement)
              this.content.scrollToPoint(0, this.unreadMsg.nativeElement.offsetTop);
          }, 500);

        }

      }
    });
    this.msgSub = this.chatService.onMsg.subscribe((msg: ChatMsg)=>{
      if(this.canScrollToBottom)
        this.content.scrollToBottom();
    });
  }

  ngOnDestroy(): void {
    this.chatService.leaveConversation();
    this.sub.unsubscribe();
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

}
