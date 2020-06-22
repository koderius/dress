import {Component, OnInit} from '@angular/core';
import {ScreenSizeUtil} from '../Utils/ScreenSizeUtil';
import {Dress, DressSize, DressStatus} from '../models/Dress';
import {ActivatedRoute} from '@angular/router';
import {CategoriesService} from '../services/categories.service';
import {FilesUploaderService} from '../services/files-uploader.service';
import {DressEditorService} from '../services/dress-editor.service';

@Component({
  selector: 'app-dress-edit',
  templateUrl: './dress-edit.page.html',
  styleUrls: ['./dress-edit.page.scss'],
})
export class DressEditPage implements OnInit {

  dress: Dress;

  originalDress: string;

  isNew: boolean;

  DressSizes = DressSize;

  photosSliderOptions = {slidesPerView: ScreenSizeUtil.CalcScreenSizeFactor() * 4};
  photosInProgress = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private dressEditor: DressEditorService,
    public categoryService: CategoriesService,
    private filesUploader: FilesUploaderService,
  ) { }

  ngOnInit() {

    // Get dress ID from URL and load it, or create new
    const params = this.activatedRoute.snapshot.params;
    if(params['id'] == 'new') {
      this.dress = new Dress({id: this.dressEditor.generateNewId()});
      this.isNew = true;
    }
    else {
      // TODO: Get dress from server
    }

    this.originalDress = JSON.stringify(this.dress);

  }


  hasChanges() : boolean {
    return JSON.stringify(this.dress) != this.originalDress;
  }


  editClicked(ev) {
    const inputEl = ev.target.parentElement.getElementsByTagName('input')[0];
    // inputEl.parentElement.setAttribute('readonly', false);
    setTimeout(()=>{
      inputEl.select();
    }, 200);
  }

  openCalendar(ev) {
    // TODO: Date picker
  }

  async onPhotosSelected(ev) {

    const fileList: FileList = ev.target.files;    // The given file list is not a regular array
    const files = [];
    for(let i = 0; i < fileList.length; i++)
      files.push(fileList[i]);

    const progresses = await this.filesUploader.uploadDressPhotos(this.dress.id, files);
    progresses.forEach((p, i)=>{
      this.photosInProgress.push(p);
      p.task.then(async (s)=>{
        this.photosInProgress.splice(i,1);
        this.dress.addPhoto(await s.ref.getDownloadURL());
      });
    });

  }


  /** It is possible to save dress changes only if it is a draft or in open status (cannot be edited while rented //TODO: ask: Why not?) */
  async save() {
    if(this.dress.status == DressStatus.DRAFT || this.dress.status == DressStatus.OPEN)
      await this.dressEditor.saveDress(this.dress);
  }

  /** Publish dress. Setting the status to open can be done only when the dress is in draft mode */
  async publishDress() {
    if(this.dress.status == DressStatus.DRAFT) {
      await this.save();
      await this.dressEditor.publishDress(this.dress.id);
    }
  }

}
