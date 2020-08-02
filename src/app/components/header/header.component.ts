import {Component, Input, OnInit} from '@angular/core';
import {NavigationService} from '../../services/navigation.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input() type: 'empty' | 'buttons' | 'search' = 'empty';

  showSearchbar: boolean;

  constructor(
    private navService: NavigationService,
  ) { }

  ngOnInit() {}

  searchClicked() {
    this.showSearchbar = true;
    setTimeout(()=>{
      document.getElementsByTagName('input')[0].focus();
    }, 250);
  }

  goHome() {
    this.navService.home();
  }

  goToMyProducts() {
    this.navService.myProducts();
  }

  goToUpload() {
    this.navService.editDress();
  }

}
