import {Component, Input, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input() type: 'empty' | 'buttons' | 'search' = 'empty';

  showSearchbar: boolean;

  constructor(
    private navCtrl: NavController,
  ) { }

  ngOnInit() {}

  searchClicked() {
    this.showSearchbar = true;
    setTimeout(()=>{
      document.getElementsByTagName('input')[0].focus();
    }, 250);
  }

  goToMyProducts() {
    this.navCtrl.navigateForward('tabs/profile/my-products');
  }

  goToUpload() {
    this.navCtrl.navigateForward('tabs/dress-edit');
  }

}
