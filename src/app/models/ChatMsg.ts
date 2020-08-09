import {Dress, DressProps} from './Dress';
import {UserDoc} from './User';

export type DBMsg = {
  // Whether the message was sent by the first user (false) or the second (true)
  u: boolean;
  // The message itself
  t: string | DressProps;
}

export type ChatDoc = {
  // Both users IDs
  users: string[];
  // Last read msg keys of first & second user
  lastRead0: number;
  lastRead1: number;
  // The key of the last msg
  lastMsgTime: number;
}

export type ChatPreview = {
  user?: UserDoc,
  lastMsg?: ChatMsg;
  unread?: boolean;
}

export type ChatMsg = {
  timestamp: number;
  type: 'i' | 'o';
  text?: string;
  dress?: Dress,
}
