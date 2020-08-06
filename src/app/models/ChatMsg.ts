import {Dress} from './Dress';

export type ChatMsg = {
  timestamp: number;
  type: 'i' | 'o';
  text?: string;
  dress?: Dress,
}
