import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, PendingSeller, Seller } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-sellers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sellers-mangement.html',
  styleUrls: ['./sellers-mangement.css']
})
export class SellersMangement implements OnInit {

  private adminService = inject(AdminService);
  private notification = inject(NotificationService);

  sellers: Seller[] = [];
  pending: PendingSeller[] = [];

  filteredPending: PendingSeller[] = [];
  filteredSellers: Seller[] = [];

  tab: 'all' | 'pending' = 'pending';
  search = '';
  isLoading = false;

  selected: Set<number> = new Set();

  ngOnInit(): void {
    this.loadPending();
  }

  // ================= LOAD =================
  loadAll(): void {
    this.isLoading = true;

    this.adminService.getSellers().subscribe({
      next: res => {
        this.sellers = res.data ?? [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.notification.error('Failed to load sellers');
        this.isLoading = false;
      }
    });
  }

  loadPending(): void {
    this.isLoading = true;

    this.adminService.getPendingSellers().subscribe({
      next: res => {
        this.pending = res.data ?? [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.notification.error('Failed to load pending sellers');
        this.isLoading = false;
      }
    });
  }

  // ================= FILTER (LIKE USERS) =================
  applyFilter(): void {
    const s = this.search?.toLowerCase().trim();

    // pending
    let pendingData = [...this.pending];

    if (s) {
      pendingData = pendingData.filter(x =>
        x.storeName?.toLowerCase().includes(s) ||
        x.userEmail?.toLowerCase().includes(s)
      );
    }

    this.filteredPending = pendingData;

    // all sellers
    let sellersData = [...this.sellers];

    if (s) {
      sellersData = sellersData.filter(x =>
        x.storeName?.toLowerCase().includes(s) ||
        x.userEmail?.toLowerCase().includes(s)
      );
    }

    this.filteredSellers = sellersData;
  }

  // ================= SEARCH =================
  searchSellers(): void {
    this.applyFilter();
  }

  clearSearch(): void {
    this.search = '';
    this.applyFilter();
  }

  // ================= ACTIONS =================
  approve(id: number): void {
    this.adminService.approveSeller(id).subscribe({
      next: () => {
        this.notification.success('Seller approved');
        this.loadPending();
      },
      error: () => this.notification.error('Approval failed')
    });
  }

  reject(id: number): void {
    this.adminService.rejectSeller(id).subscribe({
      next: () => {
        this.notification.success('Seller rejected');
        this.loadPending();
      },
      error: () => this.notification.error('Rejection failed')
    });
  }

  toggleSelect(id: number): void {
    this.selected.has(id)
      ? this.selected.delete(id)
      : this.selected.add(id);
  }

  batchApprove(isApproved: boolean): void {
    const payload = Array.from(this.selected).map(id => ({
      sellerId: id,
      isApproved
    }));

    this.adminService.batchApprove(payload).subscribe({
      next: () => {
        this.notification.success('Batch processed');
        this.selected.clear();
        this.loadPending();
      },
      error: () => this.notification.error('Batch failed')
    });
  }
}
