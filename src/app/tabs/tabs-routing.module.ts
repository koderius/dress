import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import {LoaderGuard} from '../loader.guard';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: () => import('../home/home.module').then(m => m.HomeModule),
            canActivate: [LoaderGuard],
          }
        ]
      },
      {
        path: 'categories',
        children: [
          {
            path: '',
            loadChildren: () => import('../categories/categories.module').then(m => m.CategoriesModule)
          }
        ]
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadChildren: () => import('../profile/profile.module').then(m => m.ProfileModule),
          }
        ]
      },
      {
        path: 'renter-profile',
        loadChildren: () => import('../renter-profile/renter-profile.module').then(m => m.RenterProfilePageModule)
      },
      {
        path: 'dress-view',
        loadChildren: () => import('../dress-view/dress-view.module').then( m => m.DressViewPageModule)
      },
      {
        path: 'purchase',
        loadChildren: () => import('../purchase/purchase.module').then( m => m.PurchasePageModule),
      },
      {
        path: 'feedback',
        loadChildren: () => import('../dress-feedback/dress-feedback.module').then(m => m.DressFeedbackPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
