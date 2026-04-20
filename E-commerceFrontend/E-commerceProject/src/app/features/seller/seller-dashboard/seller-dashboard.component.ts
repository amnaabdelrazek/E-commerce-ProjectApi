import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { SellerInventoryItem, SellerService } from '../seller.service';

@Component({
  standalone: true,
  
 selector: 'app-seller-dashboard',
 
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css']
})
export class SellerDashboardComponent implements OnInit {
  private readonly sellerService = inject(SellerService);
  private readonly notification = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);

  stats: any = null;
  isLoading = true;
  isInventoryLoading = true;
  errorMessage = '';
  inventoryErrorMessage = '';
  inventory: SellerInventoryItem[] = [];
  stockDrafts: Record<number, number> = {};
  savingStockIds = new Set<number>();

  ngOnInit(): void {
    this.loadStats();
    this.loadInventory();
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

  loadInventory(): void {
    this.isInventoryLoading = true;
    this.inventoryErrorMessage = '';

    this.sellerService.getMyInventory().subscribe({
      next: (response) => {
        if (!response?.isSuccess) {
          this.inventoryErrorMessage = response?.message || 'Failed to load your inventory.';
          this.inventory = [];
          this.stockDrafts = {};
          this.isInventoryLoading = false;
          this.cdr.detectChanges();
          return;
        }

        this.inventory = response.data || [];
        this.stockDrafts = this.inventory.reduce<Record<number, number>>((drafts, product) => {
          drafts[product.id] = product.stockQuantity;
          return drafts;
        }, {});
        this.isInventoryLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load inventory', err);
        this.inventoryErrorMessage = 'Failed to load your inventory. Please try again later.';
        this.inventory = [];
        this.stockDrafts = {};
        this.isInventoryLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  trackByProductId(_: number, product: SellerInventoryItem): number {
    return product.id;
  }

  getDraftStock(productId: number): number {
    return this.stockDrafts[productId] ?? 0;
  }

  hasStockChanged(product: SellerInventoryItem): boolean {
    return this.getDraftStock(product.id) !== product.stockQuantity;
  }

  isSavingStock(productId: number): boolean {
    return this.savingStockIds.has(productId);
  }

  updateDraftStock(productId: number, value: string | number): void {
    const numericValue = Number(value);
    this.stockDrafts[productId] = Number.isFinite(numericValue) ? Math.max(0, Math.trunc(numericValue)) : 0;
  }

  resetStock(product: SellerInventoryItem): void {
    this.stockDrafts[product.id] = product.stockQuantity;
  }

  saveStock(product: SellerInventoryItem): void {
    const newQuantity = this.getDraftStock(product.id);

    if (newQuantity < 0) {
      this.notification.error('Stock quantity cannot be negative.');
      this.resetStock(product);
      return;
    }

    if (!this.hasStockChanged(product) || this.isSavingStock(product.id)) {
      return;
    }

    this.savingStockIds.add(product.id);

    this.sellerService.updateStock(product.id, newQuantity).subscribe({
      next: (response) => {
        if (!response?.isSuccess) {
          this.notification.error(response?.message || 'Failed to update stock.');
          this.savingStockIds.delete(product.id);
          this.cdr.detectChanges();
          return;
        }

        this.inventory = this.inventory.map((item) =>
          item.id === product.id ? { ...item, stockQuantity: newQuantity } : item
        );
        this.stockDrafts[product.id] = newQuantity;
        this.notification.success(response.message || 'Stock updated successfully.');
        this.savingStockIds.delete(product.id);
        this.loadStats();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to update stock', err);
        this.notification.error('Failed to update stock. Please try again.');
        this.savingStockIds.delete(product.id);
        this.cdr.detectChanges();
      }
    });
  }
}
