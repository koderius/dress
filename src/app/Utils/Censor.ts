import {Subject} from 'rxjs';

export class Censor {

  private _chatBlock = new Subject<void>();
  public chatBlock$ = this._chatBlock.asObservable();

  // List of forbidden words
  private words = [
    'phone',
    'facebook',
    'mail',
    'contact',
    'call',
    'outside',
    '@',
  ]

  constructor(private messages: string[] = []) {}

  filterMsg(msg: string) : string {
    if(!msg)
      return '';
    // If the message itself is forbidden, censor it
    if (this.testMsg(msg)) {
      return '******';
    }
    else {
      // Add message, keep only the last 10 messages
      this.messages.push(msg.trim());
      if(this.messages.length > 10) {
        this.messages.shift();
      }
    }
    // If the message is part of chained forbidden messages, stop the chat
    if (this.testMsg(this.messages.join(''))) {
      this._chatBlock.next();
      this._chatBlock.complete();
      return '******';
    }
    // If message is valid, return it
    else {
      return msg;
    }
  }

  // Check whether a message need to be censored
  private testMsg(msg: string) : boolean {
    return this.findWord(msg) ||
      this.findURL(msg) ||
      this.findPhoneNumber(msg);
  }

  // Check whether the message contains one of the forbidden words
  private findWord(msg: string) : boolean {
    return this.words.some(word => msg.includes(word));
  }

  // Check whether there is some URL address in the message
  private findURL(msg: string) : boolean {
    return msg.split(' ').some((word) => {
      try {
        new URL(word);
        return true;
      }
      catch {
        return false;
      }
    });
  }

  // Check whether there are more than 6 digits in the message
  private findPhoneNumber(msg: string) : boolean {
    let counter = 0;
    for (let i = 0; i < msg.length; i++) {
      const c = msg.charAt(i);
      if(!isNaN(+c)) {
        counter++;
      }
    }
    return counter > 6;
  }

}
