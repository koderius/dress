import {UserInfo} from 'firebase';

/** User's app data. It extends the basic firebase user info */
export interface UserDoc extends Partial<UserInfo> {
  fullName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  size?: string;
  rank?: number[];
}
