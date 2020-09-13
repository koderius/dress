import { Component, OnInit } from '@angular/core';
import {ModalController} from '@ionic/angular';
import {AlertsService} from '../../services/Alerts.service';
import {CloudFunctions} from '../../../FirebaseCloudFunctions';

enum Subjects {
  SUPPORT = 'Support',
  PAYMENT = 'Payments issues',
  RENT_REPORT = 'Report rent deal',
  OTHER = 'Other',
}

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent implements OnInit {

  Subjects = Subjects;

  subjects = Object.keys(Subjects).map((k)=>Subjects[k]);

  subject: Subjects;
  customSubject: string;
  text: string;

  constructor(
    private modalCtrl: ModalController,
    private alertService: AlertsService,
  ) { }

  ngOnInit() {}

  async send() {
    const subject = this.subject == Subjects.OTHER
      ? (`${this.subject}: ${this.customSubject}`)
      : this.subject;
    this.alertService.showLoader('Sending...');
    await CloudFunctions.reportToSupport({subject: subject, text: this.text});
    this.alertService.dismissLoader();
    await this.alertService.notice('Your message has been sent to our support', 'Thanks!');
    this.close();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  get sendDisabled() : boolean {
    return (this.subject == Subjects.OTHER ? !this.customSubject : !this.subject) || !this.text;
  }

}
