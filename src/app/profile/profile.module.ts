import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfilePage } from './profile-page.component';
import {ComponentsModule} from '../components/components.module';
import {LeaveProfileGuard} from './leave-profile-guard.service';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProfilePage,
        canDeactivate: [LeaveProfileGuard],
      },
      {
        path: 'my-products',
        loadChildren: () => import('../my-products/my-products.module').then(m => m.MyProductsPageModule)
      },
    ]),
    ComponentsModule,
  ],
  declarations: [ProfilePage]
})
export class ProfileModule {}
