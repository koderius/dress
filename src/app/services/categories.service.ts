import { Injectable } from '@angular/core';
import {DressCategory} from '../models/Dress';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

/**
 * This service contains all the dress categories data
 */
@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  readonly categoriesRef = firebase.firestore().collection('categories');

  // TODO: Temporary mocks
  private _categories: DressCategory[] = [];

  constructor() {

    // Observe the categories data
    this.categoriesRef.onSnapshot(snapshot => {
      this._categories = snapshot.docs.map((d)=>d.data() as DressCategory);
    });

  }

  get allCategories() {
    return this._categories.slice();
  }

  getCategoryById(id: string) {
    return this._categories.find((c)=>c.id == id);
  }

}
