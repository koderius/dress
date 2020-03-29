import { Component, OnInit } from '@angular/core';
import {TERMS} from '../../assets/TERMS';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
})
export class TermsComponent implements OnInit {

  termsText = TERMS;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  agree() {
    this.modalCtrl.dismiss();
    //TODO: Need to accept terms?
  }

}
