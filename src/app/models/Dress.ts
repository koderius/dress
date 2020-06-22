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

export const DressSize = ['XS','S','M','L','XL','XXL','3XL'];

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
  size?: string;
  state?: string;
  datesRange?: Date[];
  price?: number;
  deposit?: number;
  ranks?: number[];
  color?: string;
  supplyDays?: number;
  returnDays?: number;
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

  get description() {
    return this._props.description || '';
  }

  set description(description: string) {
    this._props.description = description;
  }

  get style() {
    return this._props.style;
  }

  set style(style : string) {
    this._props.style = style;
  }

  get color() {
    return this._props.color;
  }

  set color(color : string) {
    this._props.color = color;
  }

  get size() {
    return this._props.size;
  }

  set size(size : string) {
    this._props.size = size;
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
    if(!this._props.photos)
      this._props.photos = [];
    this._props.photos.push(photo);
  }

  /** Remove photo from list */
  removePhoto(idx: number) {
    if(this._props.photos)
      this._props.photos.splice(idx, 1);
    if(!this._props.photos.length)
      delete this._props.photos
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

  get deposit() {
    return this._props.deposit;
  }

  set deposit(deposit: number) {
    this._props.deposit = deposit;
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

  get supplyDays() {
    return this._props.supplyDays;
  }

  set supplyDays(supplyDays: DressStatus) {
    this._props.supplyDays = supplyDays;
  }

  get returnDays() {
    return this._props.returnDays;
  }

  set returnDays(returnDays: DressStatus) {
    this._props.returnDays = returnDays;
  }

}
