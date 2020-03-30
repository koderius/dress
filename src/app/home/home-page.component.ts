import { Component } from '@angular/core';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home-page.component.html',
  styleUrls: ['home-page.component.scss']
})
export class HomePage {

  constructor(private authService: AuthService) {}

}
