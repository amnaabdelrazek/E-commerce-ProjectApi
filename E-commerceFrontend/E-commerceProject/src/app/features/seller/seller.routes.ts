import { Routes } from '@angular/router';
import { SellerDashboardComponent } from './seller-dashboard/seller-dashboard.component';
import { SellerProfileComponent } from './seller-profile/seller-profile.component';
import { SellerAddProductComponent } from './seller-add-product/seller-add-product.component';
import { SellerLayoutComponent } from './seller-layout/seller-layout.component';
import { SellerEditProductComponent } from './seller-edit-product/seller-edit-product.component';

export const SELLER_ROUTES: Routes = [
  {
    path: '',
    component: SellerLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: SellerDashboardComponent,
        data: { title: 'Dashboard' }
      },
      {
        path: 'profile',
        component: SellerProfileComponent,
        data: { title: 'Profile' }
      },
      {
        path: 'products/new',
        component: SellerAddProductComponent,
        data: { title: 'Add New Product' }
      },
      {
        path: 'products/:id/edit',
        component: SellerEditProductComponent,
        data: { title: 'Edit Product' }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
