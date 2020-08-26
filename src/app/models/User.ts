import {UserInfo} from 'firebase';
import {Ranks} from './Feedback';

/** User's app data. It extends the basic firebase user info */
export interface UserDoc extends Partial<UserInfo> {
  fullName?: string;
  address?: string;
  city?: string;
  country?: string;
  state?: string;
  zipCode?: string;
  size?: string;
  ranks?: Ranks;
}
