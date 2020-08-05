import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HeaderComponent} from './header/header.component';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {StarsComponent} from './stars/stars.component';
import {TermsComponent} from './terms/terms.component';
import {DressCardComponent} from './dress-card/dress-card.component';
import {FilterComponent} from './filter/filter.component';
import {HideHeaderDirective} from '../directives/hide-header.directive';
import {DressSizePipe} from '../pipe/dress-size.pipe';
import {PhotoPopoverComponent} from './photo-popover/photo-popover.component';
import {DressStatusPipe} from '../pipe/dress-status.pipe';
import {feedBacksListComponent} from './feed-backs-list/feed-backs-list.component';
import {ChatModal} from '../chat-modal/chat-modal.component';



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
  ],
  entryComponents: [
    TermsComponent,
    PhotoPopoverComponent,
    ChatModal,
  ]
})
export class ComponentsModule { }
