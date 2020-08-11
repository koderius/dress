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

export const DressSize = ['','XS','S','M','L','XL','XXL','3XL'];

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
  owner?: string;
  name?: string;
  category?: string;
  description?: string;
  style?: string;
  size?: string;
  country?: string;
  datesRange?: number[];
  price?: number;
  deposit?: number;
  ranks?: number[];
  rank?: number;
  color?: string;
  supplyDays?: number;
  returnDays?: number;
  photos?: string[];
  mainPhoto?: number;
  status?: DressStatus;       // Property name is important for firestore rules
  created?: number;
  modified?: number;
  publishValid?: boolean
}


export class Dress extends BaseModel implements DressProps {

  constructor(protected _props : DressProps = {}) {
    super(_props);
    if(!this._props.rank)
      this._props.rank = 0;
  }

  get owner() {
    return this._props.owner;
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

  get mainPhoto() {
    return this._props.mainPhoto || 0;
  }

  set mainPhoto(idx: number) {
    this._props.mainPhoto = idx;
  }

  /** Get the first photo, or some default image if there are no photos */
  get photo() {
    return this.photos.length ? this.photos[this.mainPhoto] : '../assets/images/default_dress.jpg';
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
    if(idx < this.mainPhoto)
      this._props.mainPhoto--;
    else if(idx == this.mainPhoto)
      this._props.mainPhoto = 0;
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

  get country() {
    return this._props.country;
  }

  set country(country: string) {
    this._props.country = country;
  }

  get status() {
    return this._props.status || DressStatus.DRAFT;
  }

  set status(status: DressStatus) {
    this._props.status = status;
  }

  get fromDate() {
    if(this._props.datesRange && this._props.datesRange[0])
      return new Date(this._props.datesRange[0]);
  }

  set fromDate(date: Date) {
    if(!this._props.datesRange)
      this._props.datesRange = [];
    this._props.datesRange[0] = new Date(date).getTime();
    if(this._props.datesRange[1] && this._props.datesRange[0] > this._props.datesRange[1])
      this._props.datesRange[1] = this._props.datesRange[0];
  }

  get toDate() {
    if(this._props.datesRange && this._props.datesRange[1])
      return new Date(this._props.datesRange[1]);
  }

  set toDate(date: Date) {
    if(!this._props.datesRange)
      this._props.datesRange = [];
    this._props.datesRange[1] = new Date(date).getTime();
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

  get publishValid() {
    return this._props.publishValid;
  }

  set publishValid(valid: boolean) {
    this._props.publishValid = valid;
  }

}
