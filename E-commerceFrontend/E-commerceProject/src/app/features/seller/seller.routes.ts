import { Routes } from '@angular/router';
import { SellerDashboardComponent } from './seller-dashboard/seller-dashboard.component';
import { SellerProfileComponent } from './seller-profile/seller-profile.component';
import { SellerAddProductComponent } from './seller-add-product/seller-add-product.component';

export const SELLER_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: SellerDashboardComponent
  },
  {
    path: 'profile',
    component: SellerProfileComponent
  },
  {
    path: 'products/new',
    component: SellerAddProductComponent
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
