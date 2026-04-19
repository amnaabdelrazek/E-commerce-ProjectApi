import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SellerService } from '../seller.service';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  
 selector: 'app-seller-dashboard',
 
  imports: [CommonModule, RouterModule],
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css']
})
export class SellerDashboardComponent implements OnInit {
  stats: any = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private sellerService: SellerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.sellerService.getDashboardStats().subscribe({
      next: (response) => {
        // The API returns a GeneralResponse object, so we access the .data property safely
        this.stats = response?.data || response || {};
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load dashboard stats', err);
        this.errorMessage = 'Failed to load dashboard statistics. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
