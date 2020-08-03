import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import Reference = firebase.storage.Reference;
import {FirebaseError} from 'firebase';
import UploadTask = firebase.storage.UploadTask;

/** An object that being returned for each upload task */
export type UploadProgress = {

  /** Upload progress (in percents) */
  progress?: number;

  /** Upload status */
  state?: 'running' | 'paused' | 'canceled' | 'done' | 'error';

  /** File download URL (gets value when upload has done) */
  url?: string;

  /** The task itself, from which the UI can commit pause/return/cancel and get the task promise */
  task?: UploadTask;

}

@Injectable({
  providedIn: 'root'
})
export class FilesUploaderService {

  readonly MAX_UPLOADS = 10;

  // The photos that were uploaded in the current edit
  private newUploadedPhotos: string[] = [];
  // The photos that were requested to be delete in the current edit
  private deleteQueue: string[] = [];

  constructor() {}


  /** The reference of a dress images */
  getDressRef(dressId: string) : Reference {
    return firebase.storage().ref('dressImages/' + dressId);
  }


  /** Upload multiple photos */
  async uploadDressPhotos(dressId: string, files: File[]) : Promise<UploadProgress[]> {

    if(files.length > this.MAX_UPLOADS)
      return;

    const ref = this.getDressRef(dressId);
    const list = await ref.listAll();       // TODO: Check identical files names

    const uploadProgresses: UploadProgress[] = [];

    files.forEach((file: File)=>{

      // Upload the file to its reference
      const fileRef = ref.child(file.name);
      const task = fileRef.put(file);

      // Create task progress object to be returned
      const progress: UploadProgress = {
        progress: 0,
        task: task,
      };
      uploadProgresses.push(progress);

      // Subscribe uploading task
      task.on('state_changed', (snapshot)=>{

        // Calculate the progress in %
        progress.progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

        // Update the state as 'running' or 'paused'
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED:
            progress.state = 'paused';
            break;
          case firebase.storage.TaskState.RUNNING:
            progress.state = 'running';
            break;
        }

      },

      // On error / cancel
      (error: FirebaseError)=>{
        if(error.code == 'storage/canceled')
          progress.state = 'canceled';
        else {
          progress.state = 'error';
          console.error(error);
        }
      },

      // On success
      async ()=>{
        progress.state = 'done';
        progress.url = await fileRef.getDownloadURL();
        this.newUploadedPhotos.push(progress.url);
      });

    });

    return uploadProgresses;

  }


  deletePhotoRequest(photoUrl: string) {
    this.deleteQueue.push(photoUrl);
  }


  async deleteDressPhotos(dressId: string) {
    try {
      this.getDressRef(dressId).delete();
    }
    catch (e) {
      console.error(e);
    }
  }


  /**
   * Delete all URLs in the delete queue, and clear the queues.
   * For cancel, delete all the new photos, and clear the queues.
   */
  commitChanges(cancel?: boolean) {
    const listToDelete = cancel ? this.newUploadedPhotos : this.deleteQueue;
    listToDelete.forEach(async (url)=>{
      await firebase.storage().refFromURL(url).delete()
        .catch((e)=>console.error(e));
    });
    this.deleteQueue.splice(0);
    this.newUploadedPhotos.slice(0);
  }


  async uploadUserPhoto(file: File, uid: string) : Promise<string> {
    const ref = firebase.storage().ref('users/' + uid);
    await ref.put(file);
    return await ref.getDownloadURL();
  }

  deleteUserPhoto(uid: string) {
    const ref = firebase.storage().ref('users/' + uid);
    ref.delete().catch((e)=>console.error(e));
  }

}
