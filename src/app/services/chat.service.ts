import {EventEmitter, Injectable} from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/database'
import Reference = firebase.database.Reference;
import {AuthService} from './auth.service';
import {ChatMsg} from '../models/ChatMsg';
import DataSnapshot = firebase.database.DataSnapshot;
import {Dress, DressProps} from '../models/Dress';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  // A reference for chats database
  private readonly CHAT = firebase.database().ref('chat');

  private toMeRef: Reference;
  private toPartnerRef: Reference;
  private conMetaRef: Reference;

  private partner: string;

  public isActive: boolean;

  public meta: {
    lastRead: number,
    lastMsgTime: number,
  };

  public onMessage = new EventEmitter<ChatMsg>();

  get myUid() : string{
    return this.authService.currentUser.uid;
  }

  constructor(private authService: AuthService) {}

  leaveConversation() {

    // Stop subscribing messages
    if(this.toMeRef)
      this.toMeRef.off();
    if(this.toPartnerRef)
      this.toPartnerRef.off();

    // Clear refs
    this.conMetaRef = this.toPartnerRef = this.toMeRef = null;

    this.isActive = false;
    this.meta = null;

  }

  async enterConversation(userId: string) {

    // Leave previous chat
    this.leaveConversation();

    this.partner = userId;

    try {

      // Set references for incoming and outgoing messages
      this.toMeRef = this.CHAT.child(this.myUid + '/' + this.partner);
      this.toPartnerRef = this.CHAT.child(this.partner + '/' + this.myUid);
      this.conMetaRef = this.toMeRef.child('meta');

      // Read conversation metadata (once), and set chat as active
      const metaSnapshot = await this.conMetaRef.once('value');
      this.meta = metaSnapshot.val() || {};
      this.isActive = true;

      // Subscribe incoming and outgoing messages
      this.toMeRef.on('child_added', snapshot => {
        this.handleMsg(snapshot.key, snapshot.val(), 'i');
      });
      this.toPartnerRef.on('child_added', snapshot => {
        this.handleMsg(snapshot.key, snapshot.val(), 'o');
      });

    }
    catch (e) {
      console.error(e);
    }

  }

  handleMsg(key: string, value: string | DressProps, type: 'i' | 'o') {

    // Only timestamps keys are messages
    if(!+key)
      return;

    const msgVal = value;
    const msg: ChatMsg = {
      timestamp: +key,
      type: type,
      text: typeof msgVal == 'string' ? msgVal : null,
      dress: typeof msgVal == 'object' ? new Dress(msgVal) : null,
    };

    this.onMessage.emit(msg);

    // Update current message as the last one was read
    this.conMetaRef.update({lastRead: msg.timestamp});
  }


  writeMsg(msg: string | DressProps) {

    // Add message as value, and timestamp as the key
    if(this.toPartnerRef) {
      try {
        const key = Date.now().toString();
        this.toPartnerRef.child(key).set(msg);
        // Set the timestamp as the last message time
        this.toMeRef.child('meta/lastMsgTime').set(key);
        this.toPartnerRef.child('meta/lastMsgTime').set(key);
      }
      catch (e) {
        console.error(e);
      }
    }

  }


  async getCons() {
    const snapshot = await this.CHAT.child(this.authService.currentUser.uid)
      .orderByChild('meta/lastMsgTime')
      .limitToLast(5)
      .once('value');
    return snapshot.val();
  }

}

