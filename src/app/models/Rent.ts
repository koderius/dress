import {BaseModel, BaseModelProps} from './BaseModel';
import {IUnitAmount} from 'ngx-paypal';

export enum RentStatus {
  PAST = 0,
  AGREED,
  DELIVERED,
  RECEIVED,
  DELIVERED_BACK,
}

export interface RentDoc extends BaseModelProps {
  dressId?: string;
  renterId?: string;
  ownerId?: string;
  price?: IUnitAmount;
  deposit?: IUnitAmount;
  status?: RentStatus;
  timestamp?: number;
}

export class Rent extends BaseModel implements RentDoc {

  constructor(protected _props : RentDoc = {}) {
    super(_props);
  }

  get dressId() {
    return this._props.dressId;
  }

  get renterId() {
    return this._props.renterId;
  }

  get ownerId() {
    return this._props.ownerId;
  }

}
