import {Component, Input} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {CategoriesService} from '../services/categories.service';
import {Dress, DressCategory} from '../models/Dress';
import {ScreenSizeUtil} from '../Utils/ScreenSizeUtil';
import {DressesService} from '../services/dresses.service';
import {ActivatedRoute} from '@angular/router';
import {NavController} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home-page.component.html',
  styleUrls: ['home-page.component.scss']
})
export class HomePage {

  isFiltered: boolean;

  dressSliderOptions = {slidesPerView: ScreenSizeUtil.CalcScreenSizeFactor() * 2};
  categoriesSliderOptions = {slidesPerView: ScreenSizeUtil.CalcScreenSizeFactor() * 3};
  categories: DressCategory[] = [];

  popular: Dress[] = this.dressService.dresses;
  forYou: Dress[] = this.dressService.dresses;

  constructor(
    private authService: AuthService,
    private activeRoute: ActivatedRoute,
    private navCtrl: NavController,
    private categoryService: CategoriesService,
    private dressService: DressesService,
  ) {

    // Get filter query parameters
    this.activeRoute.queryParams.subscribe((params)=>{

    });

    // Get all categories
    this.categories = this.categoryService.allCategories;

  }


  backToHome() {
    this.navCtrl.navigateRoot('tabs/home', {queryParams: {}, animationDirection: 'back'});
  }

  goToCategories() {
    this.navCtrl.navigateRoot('tabs/categories', {animationDirection: 'forward'});
  }

}
