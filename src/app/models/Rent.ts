import {BaseModel, BaseModelProps} from './BaseModel';

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
  status?: RentStatus;
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
