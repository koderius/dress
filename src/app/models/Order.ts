import {BaseModelProps} from './BaseModel';

export interface Order extends BaseModelProps {
  customer: string;         // Property name is important for firestore rules
  supplier: string;         // Property name is important for firestore rules
}
