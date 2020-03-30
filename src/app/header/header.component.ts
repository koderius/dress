import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input() type: 'empty' | 'buttons' | 'search' = 'empty';

  showSearchbar: boolean;

  constructor() { }

  ngOnInit() {}

  searchClicked() {
    this.showSearchbar = true;
    setTimeout(()=>{
      document.getElementsByTagName('input')[0].focus();
    }, 250);
  }

}
