import {EventEmitter, Injectable} from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/database'
import Reference = firebase.database.Reference;
import {AuthService} from './auth.service';
import {ChatMsg} from '../models/ChatMsg';
import DataSnapshot = firebase.database.DataSnapshot;

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

  private _messages: ChatMsg[] = [];
  public meta: {
    lastRead: number,
  };

  public onMsg = new EventEmitter<ChatMsg>();

  get myUid() : string{
    return this.authService.currentUser.uid;
  }

  get messages() {
    return [...this._messages];
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

    // Clear chat messages
    this._messages.splice(0);

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
        this.handleMsg(snapshot, 'i');
      });
      this.toPartnerRef.on('child_added', snapshot => {
        this.handleMsg(snapshot, 'o');
      });

    }
    catch (e) {
      console.error(e);
    }

  }

  handleMsg(snapshot: DataSnapshot, type: 'i' | 'o') {

    // Only timestamps keys are messages
    if(!+snapshot.key)
      return;

    const msg: ChatMsg = {
      timestamp: +snapshot.key,
      text: snapshot.val(),
      type: type,
    };
    this._messages.push(msg);
    this._messages.sort((a, b) => a.timestamp - b.timestamp);
    this.onMsg.emit(msg);

    // Update current message as the last one was read
    this.conMetaRef.update({lastRead: msg.timestamp});
  }


  async writeMsg(msg: string) {

    // Add message as value, and timestamp as the key
    if(this.toPartnerRef) {
      try {
        const key = Date.now().toString();
        await this.toPartnerRef.child(key).set(msg);
      }
      catch (e) {
        console.error(e);
      }
    }

  }


}

