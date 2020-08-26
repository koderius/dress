import {Injectable} from '@angular/core';
import {DressProps, DressStatus} from '../models/Dress';
import {FilesUploaderService} from './files-uploader.service';
import {DressesService} from './dresses.service';
import {UserDataService} from './user-data.service';

/**
 * This service is response of getting current user's dresses, and create, edit & delete them.
 */
@Injectable({
  providedIn: 'root'
})
export class DressEditorService {

  constructor(
    private userService: UserDataService,
    private filesUploader: FilesUploaderService,
    private dressesService: DressesService,
  ) {}


  async loadDress(id: string) : Promise<DressProps> {
    try {
      const snapshot = await this.dressesService.dressesRef.doc(id).get();
      const doc = snapshot.data() as DressProps;
      if(doc.owner == this.userService.currentUser.uid)
        return doc;
      else
        console.error('No permission to edit this dress');
    }
    catch (e) {
      console.error(e);
    }
  }


  /** Save existing dress or create new dress */
  async saveDress(dress: DressProps, publish?: boolean) : Promise<DressProps> {

    // Get the dress document, or create new document if the dress is new (has no ID)
    const dressDoc = dress.id ? this.dressesService.dressesRef.doc(dress.id) : this.dressesService.dressesRef.doc();
    dress.id = dressDoc.id;
    dress.owner = this.userService.currentUser.uid;
    dress.country = this.userService.currentUser.country;

    // Status for rented dress, cannot be changed
    if(dress.status != DressStatus.RENTED)
      dress.status = publish ? DressStatus.OPEN : DressStatus.DRAFT;

    if(publish) {
      dress.modified = Date.now();
      if(!dress.created)
        dress.created = Date.now();
    }

    // Set the dress document with the new data
    await dressDoc.set(dress);
    this.filesUploader.commitChanges();
    return dress;

  }


  /** Delete dress from user's collection. Cloud function will delete its images from storage */
  async deleteDress(dressId: string) : Promise<boolean> {
    try {
      await this.dressesService.dressesRef.doc(dressId).delete();
      return true;
    }
    catch (e) {
      console.error(e);
    }
  }

}
