import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import 'firebase/database'
import Reference = firebase.database.Reference;
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  // A reference for chats database
  private readonly CHAT = firebase.database().ref('chat');

  private currentChat: Reference;
  private partner: string;
  private incomingMessages: any[];
  private myMessages: any[];

  constructor(private authService: AuthService) { }

  get myUid() : string{
    return this.authService.currentUser.uid;
  }

  enterConversation(userId: string) {

    // Leave previous chat
    this.leaveConversation();

    this.partner = userId;

    try {

      // Start subscribing incoming messages
      this.currentChat = this.CHAT.child(this.partner + '/' + this.myUid);
      this.currentChat.on('child_added',snapshot => {
        this.incomingMessages.push(snapshot.val());
      });

      // Get current user's previous messages (once)
      this.CHAT.child(this.myUid + '/' + this.partner).once('value',snapshot =>{
        this.myMessages = snapshot.val();
      });

    }
    catch (e) {
      console.error(e);
    }

  }

  leaveConversation() {

    // Stop subscribing incoming messages
    if(this.currentChat)
      this.currentChat.off();

    this.currentChat = null;
    this.partner = null;

    // Clear chat messages
    this.incomingMessages = [];
    this.myMessages = [];

  }


  async writeMsg(msg: string) {

    if(this.partner) {

      try {
        await this.CHAT.child(this.myUid + '/' + this.partner).child(Date.now().toString()).set(msg);
        this.myMessages.push(msg);
      }
      catch (e) {
        console.error(e);
      }

    }

  }

}
