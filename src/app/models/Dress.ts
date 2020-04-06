import {BaseModel, BaseModelProps} from "./BaseModel";

/**
 * Dress Category ID and its title
 */
export type DressCategory = {
  id: string;
  title: string;
  image: string;
}

/**
 * Color contains its hex code (which is also its ID), and a title
 */
export type Color = {
  hex: string;
  title: string;
}

/**
 * Dress status enum
 */
export enum DressStatus {
  DRAFT = 0,
  OPEN,
  RENTED,
}

/**
 * Dress properties
 */
export interface DressProps extends BaseModelProps {
  name?: string;
  category?: string;
  description?: string;
  style?: string;
  state?: string;
  datesRange?: number[];
  price?: number;
  ranks?: number[];
  color?: string;
  supplyTime?: number;
  returnTime?: number;
  photos?: string[];
  status?: DressStatus;       // Property name is important for firestore rules
}


export class Dress extends BaseModel implements DressProps {

  constructor(protected _props : DressProps = {}) {
    super(_props);
  }

  get name() {
    return this._props.name;
  }

  set name(name : string) {
    this._props.name = name;
  }

  get category() {
    return this._props.category;
  }

  set category(categoryId: string) {
    this._props.category = categoryId;
  }

  /** Get the first photo, or some default image if there are no photos */
  get photo() {
    return this.photos.length ? this.photos[0] : '' // TODO: Default image for no photo
  }

  /** List of all photos */
  get photos() {
    return this._props.photos ? this._props.photos.slice() : [];
  }

  /** Set the list of photos */
  set photos(photos: string[] | null) {
    this._props.photos = photos;
  }

  /** Add photo to list */
  addPhoto(photo: string) {
    this._props.photos.push(photo);
  }

  /** Remove photo from list */
  removePhoto(idx: number) {
    this._props.photos.splice(idx, 1);
  }

  get ranks() {
    return this._props.ranks ? this._props.ranks.slice() : [];
  }

  set ranks(ranks: number[]) {
    this._props.ranks = ranks;
  }

  get price() {
    return this._props.price;
  }

  set price(price: number) {
    this._props.price = price;
  }

  get state() {
    return this._props.state;
  }

  set state(state: string) {
    this._props.state = state;
  }

  get status() {
    return this._props.status;
  }

  set status(status: DressStatus) {
    this._props.status = status;
  }

  get fromDate() {
    return new Date(this._props.datesRange[0]);
  }

  get toDate() {
    return new Date(this._props.datesRange[1]);
  }

}
