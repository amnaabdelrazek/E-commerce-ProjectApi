import { Component, OnInit } from '@angular/core';
import { SellerService } from '../seller.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  imports: [CurrencyPipe],
  selector: 'app-seller-dashboard',
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css']
})
export class SellerDashboardComponent implements OnInit {
  dashboardStats: any;

  constructor(private sellerService: SellerService) { }

  ngOnInit(): void {
    this.sellerService.getDashboardStats().subscribe(stats => {
      this.dashboardStats = stats;
    });
  }
}
