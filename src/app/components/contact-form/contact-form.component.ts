import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/functions';
import {ModalController} from '@ionic/angular';
import {AlertsService} from '../../services/Alerts.service';

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
    const fn = firebase.functions().httpsCallable('reportToSupport');
    const subject = this.subject == Subjects.OTHER
      ? (`${this.subject}: ${this.customSubject}`)
      : this.subject;
    this.alertService.showLoader('Sending...');
    await fn({subject: subject, text: this.text});
    this.alertService.dismissLoader();
    this.alertService.notice('Your message has been sent to our support', 'Thanks!');
  }

  close() {
    this.modalCtrl.dismiss();
  }

  get sendDisabled() : boolean {
    return (this.subject == Subjects.OTHER ? !this.customSubject : !this.subject) || !this.text;
  }

}
