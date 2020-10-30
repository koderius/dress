import {EventEmitter, Injectable} from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import {AuthService} from './auth.service';
import {ChatDoc, ChatMsg, ChatPreview, DBMsg} from '../models/ChatMsg';
import {Dress, DressProps} from '../models/Dress';
import DocumentReference = firebase.firestore.DocumentReference;
import {UserDataService} from './user-data.service';
import {Censor} from '../Utils/Censor';
import {AlertsService} from './Alerts.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  // A reference for chats database
  private readonly CHAT = firebase.firestore().collection('chats');

  private chatRef: DocumentReference;
  private chatSub: ()=>void;

  private partner: string;
  private ids: string[];

  public isActive: boolean;

  // Last read message time
  public lastRead: number;
  public lastMsgTime: number;

  public onMessage = new EventEmitter<ChatMsg>();

  public lastChats: ChatPreview[];
  private lastChatsUnsub: ()=>void;

  private censor: Censor;

  get myUid() : string{
    return this.authService.currentUser ? this.authService.currentUser.uid : null;
  }

  constructor(
    private authService: AuthService,
    private userData: UserDataService,
    private alerts: AlertsService,
  ) {

    // Subscribe user's last chats
    this.userData.userDoc$.subscribe((user)=>{
      if(this.lastChatsUnsub) {
        this.lastChatsUnsub();
        this.lastChats = null;
      }
      if(user)
        this.subscribeLastCons(5);
    });

  }

  leaveConversation() {

    // Stop subscribing messages
    if(this.chatSub)
      this.chatSub();

    // Clear refs
    this.chatRef = null;

    this.isActive = false;
    this.lastRead = null;

  }

  async enterConversation(userId: string) {

    // Leave previous chat
    this.leaveConversation();

    this.partner = userId;

    this.censor = new Censor();
    this.censor.chatBlock$.subscribe(() => {
      this.chatRef.delete();
      this.leaveConversation();
      this.alerts.notice('Suspicious messages content', 'Chat was blocked!', 'We suspect your interlocutor was trying to contact you outside the app.')
    });

    try {

      this.ids = [this.myUid, this.partner].sort((a, b) => a.localeCompare(b));

      // Set references for the chat by the users IDs
      this.chatRef = this.CHAT.doc(this.ids.join('_'));
      this.chatRef.set({users: this.ids}, {merge: true});

      // Read conversation metadata (once), and set chat as active
      const meta = (await this.chatRef.get()).data();
      this.lastRead = meta ? (meta['lastRead' + this.ids.indexOf(this.myUid)] || 0) : 0;
      this.lastMsgTime = meta ? (meta.lastMsgTime || 0) : 0;
      console.log(this.lastRead);
      this.isActive = true;

      // Subscribe incoming and outgoing messages
      this.chatSub = this.chatRef.collection('chat').onSnapshot(snapshot => {
        snapshot.docChanges().forEach((d)=>{
          if(d.type == 'added')
            this.handleMsg(d.doc.id, d.doc.data() as DBMsg);
        })
      });

    }
    catch (e) {
      console.error(e);
    }

  }


  // Convert the message data as in the database to app's front message data
  private fromDBToFront(key: string, value: DBMsg, ids: string[]) : ChatMsg {
    const sentBy = ids[+value.u];
    const msgVal = value.t;
    return {
      timestamp: +key,
      type: sentBy == this.myUid ? 'o' : 'i',
      text: typeof msgVal == 'string' ? msgVal : null,
      dress: typeof msgVal == 'object' ? new Dress(msgVal) : null,
    };
  }


  handleMsg(key: string, value: DBMsg) {

    // Translate message and emit it in event
    const msg = this.fromDBToFront(key, value, this.ids);

    // Incoming messages pass through the censorship
    if(msg.type === 'i') {
      msg.text = this.censor.filterMsg(msg.text);
    }

    this.onMessage.emit(msg);

    // Update new messages last read
    if(msg.timestamp >= (this.lastMsgTime || 0)) {
      const lastReadProp = 'lastRead' + this.ids.indexOf(this.myUid);
      this.chatRef.update({[lastReadProp]: msg.timestamp});
    }
  }


  async writeMsg(msg: string | DressProps) {

    // Add message as value, and timestamp as the key
    if(this.chatRef) {
      try {
        const key = Date.now().toString();
        await this.chatRef.collection('chat').doc(key).set({
          t: msg,
          u: !!this.ids.indexOf(this.myUid),
        });
        // Set the timestamp as the last message time
        this.chatRef.update({lastMsgTime: +key});
      }
      catch (e) {
        console.error(e);
      }
    }

  }


  // Get last X chats
  private async subscribeLastCons(limit: number) {

    // Start subscribing the last X chats
    this.lastChatsUnsub = await this.CHAT.where('users', 'array-contains', this.myUid)
      .orderBy('lastMsgTime', 'desc')
      .limit(limit).onSnapshot((snapshot)=>{

        if(!this.lastChats)
          this.lastChats = [];

        // Clear the old array (and keep the values)
        const tmp = [...this.lastChats];
        this.lastChats.splice(0);

        // Reorder the array
        snapshot.docChanges().filter((d)=>d.type != 'removed').forEach(async (d)=>{

          const ids = d.doc.id.split('_');
          const chatData = (d.doc.data() || {lastMsgTime : 0}) as ChatDoc;

          // If it was modified, move it to the new index
          if(d.type == 'modified')
            this.lastChats[d.newIndex] = tmp[d.oldIndex];

          // If it was added, add its data in the new index
          if(d.type == 'added') {
            this.lastChats[d.newIndex] = {};
            this.userData.getUserDoc(ids.find((id)=>id != this.myUid)).then((user)=>{
              this.lastChats[d.newIndex].user = user;
            })
          }

          // Load the new message
          if(d.type == 'added' || (this.lastChats[d.newIndex].lastMsg && this.lastChats[d.newIndex].lastMsg.timestamp != chatData.lastMsgTime)) {
            const msgSnap = await this.CHAT.doc(d.doc.id).collection('chat').doc(chatData.lastMsgTime.toString()).get();
            this.lastChats[d.newIndex].lastMsg = this.fromDBToFront(msgSnap.id, msgSnap.data() as DBMsg, ids);
          }

          // Update read/unread
          this.lastChats[d.newIndex].unread = chatData.lastMsgTime != chatData['lastRead' + +ids.indexOf(this.myUid)];

        });

      });

  }

  // // Get last X messages of a chat
  // async getConMessages(conId: string, numOfMessages) : Promise<ChatMsg[]> {
  //
  //   const snapshot = await this.CHAT.doc(conId).collection('chat')
  //     .orderBy(firebase.firestore.FieldPath.documentId())
  //     .limit(numOfMessages).get();
  //
  //   return snapshot.docs.map((d)=>this.fromDBToFront(d.id, d.data() as DBMsg, conId.split('_')));
  //
  // }

}

