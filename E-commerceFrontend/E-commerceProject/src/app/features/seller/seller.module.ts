import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SellerDashboardComponent } from './seller-dashboard/seller-dashboard.component';
import { SELLER_ROUTES } from './seller.routes';

@NgModule({
  declarations: [
    SellerDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(SELLER_ROUTES)
  ]
})
export class SellerModule { }
