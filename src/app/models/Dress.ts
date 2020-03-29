import {BaseModel, BaseModelProps} from "./BaseModel";

/**
 * Dress Category ID and its title
 */
export type DressCategory = {
  id: string;
  title: string;
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
  rank?: number;
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

}
