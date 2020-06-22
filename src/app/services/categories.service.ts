import { Injectable } from '@angular/core';
import {DressCategory} from '../models/Dress';

/**
 * This service contains all the dress categories data
 */
@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  // TODO: Temporary mocks
  private _categories: DressCategory[] = [
    {
      id: 'c1',
      title: 'Wedding',
      image: '../../assets/categories/wedding.png'
    },
    {
      id: 'c2',
      title: 'Evening',
      image: '../../assets/categories/evening.png'
    },
    {
      id: 'c3',
      title: 'Mini',
      image: '../../assets/categories/mini.png'
    },
    {
      id: 'c4',
      title: 'Party',
      image: '../../assets/categories/party.png'
    }
  ];

  constructor() { }

  get allCategories() {
    return this._categories.slice();
  }

  getCategoryById(id: string) {
    return this._categories.find((c)=>c.id == id);
  }

}
