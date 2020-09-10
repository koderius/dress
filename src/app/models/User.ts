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
  paypalEmail?: string;
}

// export class UserDoc {
//
//   private _photoURL: string;
//   //
//   // get fullName() {
//   //   return this.displayName;
//   // }
//   //
//   // set fullName(name: string) {
//   //   this.displayName = name;
//   // }
//
//   getNames() {
//     const names = this.displayName.split(' ').map((n)=>n.trim()).filter((v)=>v);
//     return {
//       firstName: names[0],
//       lastName: names.length > 1 ? names.slice(-1)[0] : '',
//       middleName: names.slice(1, -1).join(' '),
//     }
//   }
//
//   get photoURL() : string {
//     return this._photoURL;
//   }
//
//   set photoURL(url: string) {
//     const img = new Image();
//     img.onload = ()=> {
//       this._photoURL = url;
//     };
//     img.src = url;
//   }
//
//   constructor() {}
//
// }
