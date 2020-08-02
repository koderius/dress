import { Component, OnInit } from '@angular/core';
import {AuthService, UserDoc} from '../services/auth.service';
import {ActivatedRoute} from '@angular/router';
import {RankCalc} from '../Utils/RankCalc';
import {NavigationService} from '../services/navigation.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './renter-profile-page.component.html',
  styleUrls: ['./renter-profile-page.component.scss'],
})
export class RenterProfilePage implements OnInit {

  RankCalc = RankCalc;

  userDoc: UserDoc;

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private navService: NavigationService
  ) {}

  async ngOnInit() {

    // Get user document according to url
    const uid = this.activatedRoute.snapshot.params.uid;
    this.userDoc = await this.authService.getUserDoc(uid);

  }

  isMe() : boolean {
    return this.userDoc.uid == this.authService.currentUser.uid;
  }

  goToEdit() {
    this.navService.profile();
  }

}
