import { Injectable } from '@angular/core';
import {DressProps, DressStatus} from '../models/Dress';
import {AuthService} from './auth.service';
import {FilesUploaderService} from './files-uploader.service';

/**
 * This service is response of getting current user's dresses, and create, edit & delete them.
 */
@Injectable({
  providedIn: 'root'
})
export class DressEditorService {

  /** Returns reference to current user's dresses collection */
  private myDressesCollection = () => this.authService.userProfileDoc().collection('dresses');

  /** All user's dresses */
  myDresses: DressProps[] = [];
  unsubscribe;

  constructor(
    private authService: AuthService,
    private filesUploader: FilesUploaderService,
  ) {

    // When the user is ready
    this.authService.onUserReady.subscribe(()=>{

      // Stop subscribe previous user's collection (if there was)
      if(this.unsubscribe)
        this.unsubscribe();

      // Start subscribe current user's collection
      try {
        this.unsubscribe = this.myDressesCollection().onSnapshot((snapshot)=>{
          this.myDresses = snapshot.docs.map((d)=>d.data());
        });
      }
      catch (e) {
        console.error(e);
      }

    });

  }


  generateNewId() : string {
    return this.myDressesCollection().doc().id;
  }


  /** Save existing dress or create new dress */
  async saveDress(dress: DressProps) : Promise<void> {

    // Get the dress document, or create new document if the dress is new (has no ID)
    const dressDoc = dress.id ? this.myDressesCollection().doc(dress.id) : this.myDressesCollection().doc();

    // Set the dress document with the new data
    try {
      return await dressDoc.set(dress, {merge: true});
    }
    catch (e) {
      console.error(e);
    }

  }


  /** Delete dress from user's collection, and delete its images from storage */
  async deleteDress(dressId: string) {
    try {
      await this.myDressesCollection().doc(dressId).delete();
      return await this.filesUploader.deleteDressPhotos(dressId);
    }
    catch (e) {
      console.error(e);
    }
  }


  /** Set dress status as open */
  async publishDress(dressId: string) {
    try {
      this.myDressesCollection().doc(dressId).update({status: DressStatus.OPEN});
    }
    catch (e) {
      console.error(e);
    }
  }

}
