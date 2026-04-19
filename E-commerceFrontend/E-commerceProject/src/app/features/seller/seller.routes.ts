import { Routes } from '@angular/router';
import { SellerDashboardComponent } from './seller-dashboard/seller-dashboard.component';

export const SELLER_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: SellerDashboardComponent
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
