import { NgModule } from '@angular/core';
import {CommonModule, CurrencyPipe} from '@angular/common';
import {HeaderComponent} from './header/header.component';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {StarsComponent} from './stars/stars.component';
import {TermsComponent} from './terms/terms.component';
import {DressCardComponent} from './dress-card/dress-card.component';
import {FilterComponent} from './filter/filter.component';
import {HideHeaderDirective} from '../directives/hide-header.directive';
import {DressSizePipe} from '../pipes/dress-size.pipe';
import {PhotoPopoverComponent} from './photo-popover/photo-popover.component';
import {DressStatusPipe} from '../pipes/dress-status.pipe';
import {feedBacksListComponent} from './feed-backs-list/feed-backs-list.component';
import {ChatModal} from '../chat-modal/chat-modal.component';
import {MainHeaderComponent} from './main-header/main-header.component';
import {NotificationsComponent} from './notifications/notifications.component';
import {ChatOpenerService} from '../chat-modal/chat-opener.service';
import {AppCurrencyPipe} from '../pipes/app-currency.pipe';
import {CountryPipe} from '../pipes/country.pipe';
import {PhoneNumberPipe} from '../pipes/phone-number.pipe';
import {ContactFormComponent} from './contact-form/contact-form.component';



@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  declarations: [
    HeaderComponent,
    StarsComponent,
    TermsComponent,
    DressCardComponent,
    FilterComponent,
    HideHeaderDirective,
    DressSizePipe,
    DressStatusPipe,
    PhotoPopoverComponent,
    feedBacksListComponent,
    ChatModal,
    MainHeaderComponent,
    NotificationsComponent,
    AppCurrencyPipe,
    CountryPipe,
    PhoneNumberPipe,
    ContactFormComponent,
  ],
  exports: [
    HeaderComponent,
    StarsComponent,
    DressCardComponent,
    FilterComponent,
    HideHeaderDirective,
    DressSizePipe,
    DressStatusPipe,
    PhotoPopoverComponent,
    feedBacksListComponent,
    ChatModal,
    MainHeaderComponent,
    AppCurrencyPipe,
    CountryPipe,
    PhoneNumberPipe,
  ],
  entryComponents: [
    TermsComponent,
    PhotoPopoverComponent,
    ChatModal,
    NotificationsComponent,
    ContactFormComponent,
  ],
  providers: [ChatOpenerService, CurrencyPipe]
})
export class ComponentsModule { }
