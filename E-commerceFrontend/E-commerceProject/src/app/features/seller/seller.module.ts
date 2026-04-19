import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SELLER_ROUTES } from './seller.routes';
import { SellerDashboardComponent } from './seller-dashboard/seller-dashboard.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SELLER_ROUTES),
    SellerDashboardComponent
  ]
})
export class SellerModule { }
