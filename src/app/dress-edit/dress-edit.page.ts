import {Component, OnDestroy, OnInit} from '@angular/core';
import {ScreenSizeUtil} from '../Utils/ScreenSizeUtil';
import {Dress, DressProps, DressSize, DressStatus} from '../models/Dress';
import {ActivatedRoute} from '@angular/router';
import {CategoriesService} from '../services/categories.service';
import {FilesUploaderService, UploadProgress} from '../services/files-uploader.service';
import {DressEditorService} from '../services/dress-editor.service';
import {IonInput} from '@ionic/angular';
import {ObjectsUtil} from '../Utils/ObjectsUtil';
import {AlertsService} from '../services/Alerts.service';
import {DateUtil} from '../Utils/DateUtil';
import {NavigationService} from '../services/navigation.service';
import {PhotoPopoverCtrlService} from '../components/photo-popover/photo-popover-ctrl.service';
import {AuthService, UserDoc} from '../services/auth.service';
import {DefaultUserImage} from '../Utils/Images';
import {Rent} from '../models/Rent';
import {RentService} from '../services/rent.service';

@Component({
  selector: 'app-dress-edit',
  templateUrl: './dress-edit.page.html',
  styleUrls: ['./dress-edit.page.scss'],
})
export class DressEditPage implements OnInit, OnDestroy {

  DressStatus = DressStatus;

  DefaultUserImage = DefaultUserImage;

  COIN_SIGN = '$';

  DateUtil = DateUtil;

  routeSubscription;

  dress: Dress;

  dressBeforeEdit: DressProps;

  isNew: boolean;

  DressSizes = DressSize;

  photosSliderOptions = {slidesPerView: ScreenSizeUtil.CalcScreenSizeFactor() * 3 + 0.25};
  photosInProgress: UploadProgress[] = [];

  get rented() {
    return this.dress.status == DressStatus.RENTED;
  }

  rentData: Rent;
  rentingUser: UserDoc;
  viewFullRenter: boolean;

  // Get the date of x years after the given date (or today's) as ISO (yyyy-mm-dd)
  yearsAfter(date: Date = new Date(), years = 5) {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d.toLocaleDateString('sv');
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private dressEditor: DressEditorService,
    public categoryService: CategoriesService,
    private filesUploader: FilesUploaderService,
    private alertService: AlertsService,
    private navService: NavigationService,
    private photoPopoverCtrl: PhotoPopoverCtrlService,
    private fileService: FilesUploaderService,
    private alertsService: AlertsService,
    private authService: AuthService,
    private rentService: RentService,
  ) { }

  ngOnInit() {

    // Get dress ID from URL and load it, or create new
    this.routeSubscription = this.activatedRoute.params.subscribe(async (params)=>{

      const id = params['id'];

      // Create new dress
      if(id == 'new-dress') {
        this.dress = new Dress();
        this.isNew = true;
      }

      else {

        // Load dress by ID
        const dressDoc = await this.dressEditor.loadDress(id);
        if(!dressDoc) {
          this.navService.home();
          return;
        }
        this.dress = new Dress(dressDoc);

        // Load dress renting details (if currently rented)
        if(this.dress.status == DressStatus.RENTED) {
          this.rentData = await this.rentService.getMyDressActiveRentDoc(this.dress.id);
          this.rentingUser = await this.authService.getUserDoc(this.rentData.renterId);
        }

      }

      this.dressBeforeEdit = this.dress.exportProperties();

    });

  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }


  hasChanges() : boolean {
    return this.dress && !ObjectsUtil.SameValues(this.dress.exportProperties(), this.dressBeforeEdit);
  }

  hasUploadsInProgress() : boolean {
    return !!this.photosInProgress.length;
  }


  editClicked(ev) {
    const inputEl = ev.target.parentElement.getElementsByTagName('input')[0];
    // inputEl.parentElement.setAttribute('readonly', false);
    setTimeout(()=>{
      inputEl.select();
    }, 200);
  }


  async openColorPicker(input: IonInput) {
    const el = await input.getInputElement();
    el.click()
  }

  async onPhotosSelected(ev) {

    const fileList: FileList = ev.target.files;    // The given file list is not a regular array
    const files = [];
    for(let i = 0; i < fileList.length; i++)
      files.push(fileList[i]);

    const progresses = await this.filesUploader.uploadDressPhotos(this.dress.id, files);
    progresses.forEach((p)=>{
      this.photosInProgress.push(p);
      p.task.then(async (s)=>{
        this.photosInProgress = this.photosInProgress.filter((p)=>p.state != 'done');
        const photoURL = await s.ref.getDownloadURL();
        this.dress.addPhoto(photoURL);
      });
    });

  }


  async openPhotoActionSheet(url: string, idx: number) {
    const res = await this.photoPopoverCtrl.openActionSheet(url, !this.rented);
    if(res.role == 'destructive')
      this.alertsService.areYouSure('Delete this photo?').then(async (resp)=>{
        if(resp) {
          this.fileService.deletePhotoRequest(url);
          this.dress.removePhoto(idx);
        }
      });
  }

  async openProgressActionSheet(p: UploadProgress, idx: number) {
    if(this.rented)
      return;
    const res = await this.photoPopoverCtrl.openProgressActionSheet(p);
    if(res.role == 'destructive') {
      this.photosInProgress.splice(idx,1);
    }
  }


  /** It is possible to save dress changes only if it is a draft or in open status (cannot be edited while rented //TODO: ask: Why not?) */
  async save(publish?: boolean) {
    if(this.dress.status && !publish) {
      if(!await this.alertsService.areYouSure(
        'Save dress to drafts?',
        'The dress will be moved to your drafts list, and will not be available to other users while there.',
        'Move to drafts',
        'Cancel'
      ))
        return;
    }
    this.dress.publishValid = this.checkFields();
    if(!publish || this.checkFields(true)) {
      try {
        // Save the dress and update it, with the returned data
        this.dressBeforeEdit = await this.dressEditor.saveDress(this.dress.exportProperties(), publish);
        this.dress = new Dress({...this.dressBeforeEdit});
        this.alertService.notice(`Dress was saved ${publish ? 'and published!' : 'as a draft.'}`, 'Details saved');
      }
      catch (e) {
        this.alertService.notice(e, 'Error...');
      }
    }
  }


  checkFields(verbose?: boolean) {
    const inputs = document.getElementsByTagName('input');
    for (let i = 0; i < inputs.length; i++)
      if(inputs[i].validity.valueMissing || !this.dress.fromDate || !this.dress.toDate) {
        if(verbose)
          this.alertService.notice(
            'Before publishing, all required fields must be filled',
            'Missed something...',
            'You can save it as draft in the meanwhile.'
          );
        return false;
      }
    if ((this.dress.toDate as Date).getTime() < Date.now()) {
      if(verbose)
        this.alertService.notice('The available dates have already passed', 'Dates error...');
      return false;
    }
    return true;
  }

  dressPreview() {
    if(this.checkFields(true))
      this.navService.dressView(this.dress.id);
  }

}
