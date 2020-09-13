import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DressFeedbackPageRoutingModule } from './dress-rank-feedback.module';

import { DressFeedbackPage } from './dress-feedback-page.component';
import {ComponentsModule} from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DressFeedbackPageRoutingModule,
    ComponentsModule
  ],
  declarations: [DressFeedbackPage]
})
export class DressFeedbackPageModule {}
