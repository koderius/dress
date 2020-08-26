import {UserInfo} from 'firebase';

/** User's app data. It extends the basic firebase user info */
export interface UserDoc extends Partial<UserInfo> {
  fullName?: string;
  address?: string;
  city?: string;
  country?: string;
  state?: string;
  zipCode?: string;
  size?: string;
  ranks?: number[];
}
