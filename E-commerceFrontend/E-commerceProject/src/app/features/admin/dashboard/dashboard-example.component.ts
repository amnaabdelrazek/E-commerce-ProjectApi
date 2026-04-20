/* ==========================================
   EXAMPLE: DASHBOARD COMPONENT WITH ANIMATIONS
   ========================================== */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Example implementation showing how to integrate premium animations
 * into the Admin Dashboard component.
 * 
 * Key features:
 * - Page load staggered animations
 * - Stats card hover effects with state management
 * - Dynamic table row animations
 * - Action button pop animations
 * - Loading skeleton animations
 */

interface StatCard {
  id: string;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
  color: string;
  hoverState?: 'normal' | 'hover';
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'pending';
  rowHoverState?: 'normal' | 'hover';
  actionButtonState?: 'normal' | 'clicked';
}

@Component({
  selector: 'app-dashboard-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Main dashboard container -->
    <div class="dashboard-container">
      
      <!-- Header -->
      <header class="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's your business overview.</p>
        </div>
        <div class="header-actions">
          <button class="header-btn">Download Report</button>
          <button class="header-btn">Export Data</button>
        </div>
      </header>

      <!-- Stats Grid -->
      <section class="stats-section">
        <h2>Key Metrics</h2>
        
        <div class="stats-grid">
          <div *ngFor="let stat of stats" 
               [ngClass]="stat.hoverState"
               (mouseenter)="onStatCardHover(stat, 'hover')"
               (mouseleave)="onStatCardHover(stat, 'normal')"
               class="stat-card">
            
            <div class="stat-icon">{{ stat.icon }}</div>
            <div class="stat-content">
              <h3 class="stat-label">{{ stat.label }}</h3>
              <p class="stat-value">{{ stat.value }}</p>
              <div [ngClass]="stat.isPositive ? 'positive' : 'negative'" class="stat-change">
                <span>{{ stat.isPositive ? '↑' : '↓' }}</span>
                {{ stat.change }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Products Table -->
      <section *ngIf="!isLoadingProducts" class="table-section">
        <div class="table-header">
          <h2>Recent Products</h2>
          <button class="btn-pill primary" (click)="onAddProductClick()">+ Add Product</button>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            
            <tbody>
              <tr *ngFor="let product of products"
                  [ngClass]="product.rowHoverState"
                  (mouseenter)="onRowHover(product, 'hover')"
                  (mouseleave)="onRowHover(product, 'normal')">
                
                <td class="primary-column">{{ product.name }}</td>
                <td>{{ product.category }}</td>
                <td>{{ product.price.toFixed(2) }}</td>
                <td>{{ product.stock }} units</td>
                <td>
                  <span [ngClass]="'status-badge ' + product.status">
                    {{ product.status | titlecase }}
                  </span>
                </td>
                
                <td class="action-column">
                  <button class="action-btn edit" title="Edit" (click)="onEditClick(product)">✏️</button>
                  <button class="action-btn view" title="View" (click)="onViewClick(product)">👁️</button>
                  <button class="action-btn delete" title="Delete" (click)="onDeleteClick(product)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="products.length === 0" class="empty-table-state">
            <div class="empty-state-icon">📭</div>
            <h3>No Products Found</h3>
            <p>Create your first product to get started</p>
          </div>
        </div>

        <div class="pagination">
          <button (click)="previousPage()" [disabled]="currentPage === 1">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button (click)="nextPage()" [disabled]="currentPage === totalPages">Next</button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    /* CSS imported from dashboard-animations.css and tables-animations.css */
    @import 'dashboard-animations.css';
    @import '../tables/tables-animations.css';

    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 24px;
      background-color: #f8f9fa;
      min-height: 100vh;
    }

    .stats-section h2,
    .table-section h2 {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 16px 0;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background-color: white;
      border-radius: 12px;
      padding: 32px;
      max-width: 500px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .skeleton-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
        gap: 16px;
      }

      .skeleton-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .table-header {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class DashboardExampleComponent implements OnInit, OnDestroy {
  
  // Data
  stats: StatCard[] = [];
  products: Product[] = [];
  
  // State
  isLoadingProducts = true;
  isModalOpen = false;
  currentPage = 1;
  totalPages = 5;
  addProductButtonState = 'normal';
  
  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit() {
    // Simulate page load with staggered data loading
    this.loadStats();
    this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ====== STATS CARD METHODS ======

  loadStats() {
    // Simulated API call
    this.stats = [
      {
        id: 'sales',
        label: 'Total Sales',
        value: '$45,231',
        change: '+12.5%',
        isPositive: true,
        icon: '💰',
        color: '79, 70, 229'
      },
      {
        id: 'orders',
        label: 'Orders',
        value: '1,234',
        change: '+8.2%',
        isPositive: true,
        icon: '📦',
        color: '16, 185, 129'
      },
      {
        id: 'customers',
        label: 'Customers',
        value: '8,945',
        change: '-3.1%',
        isPositive: false,
        icon: '👥',
        color: '59, 130, 246'
      },
      {
        id: 'growth',
        label: 'Growth Rate',
        value: '+18.7%',
        change: '+5.3%',
        isPositive: true,
        icon: '📈',
        color: '245, 158, 11'
      }
    ];
  }

  onStatCardHover(stat: StatCard, state: 'normal' | 'hover') {
    stat.hoverState = state;
  }

  // ====== PRODUCTS TABLE METHODS ======

  loadProducts() {
    // Simulate API call with delay
    setTimeout(() => {
      this.products = [
        {
          id: 1,
          name: 'Wireless Headphones',
          category: 'Electronics',
          price: 89.99,
          stock: 45,
          status: 'active'
        },
        {
          id: 2,
          name: 'USB-C Cable',
          category: 'Accessories',
          price: 12.99,
          stock: 200,
          status: 'active'
        },
        {
          id: 3,
          name: 'Phone Screen Protector',
          category: 'Accessories',
          price: 8.99,
          stock: 0,
          status: 'inactive'
        },
        {
          id: 4,
          name: 'Laptop Stand',
          category: 'Office',
          price: 34.99,
          stock: 15,
          status: 'pending'
        },
        {
          id: 5,
          name: 'Mechanical Keyboard',
          category: 'Electronics',
          price: 149.99,
          stock: 8,
          status: 'active'
        }
      ];
      this.isLoadingProducts = false;
    }, 1000); // Simulate network delay
  }

  onRowHover(product: Product, state: 'normal' | 'hover') {
    product.rowHoverState = state;
  }

  // ====== ACTION BUTTON METHODS ======

  onEditClick(product: Product) {
    product.actionButtonState = 'clicked';
    setTimeout(() => product.actionButtonState = 'normal', 400);
    console.log('Edit product:', product);
    this.openModal();
  }

  onViewClick(product: Product) {
    console.log('View product:', product);
  }

  onDeleteClick(product: Product) {
    product.actionButtonState = 'clicked';
    setTimeout(() => {
      product.actionButtonState = 'normal';
      this.products = this.products.filter(p => p.id !== product.id);
    }, 400);
    console.log('Delete product:', product);
  }

  onAddProductClick() {
    this.addProductButtonState = 'clicked';
    setTimeout(() => this.addProductButtonState = 'normal', 400);
    this.openModal();
  }

  // ====== MODAL METHODS ======

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // ====== PAGINATION METHODS ======

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts(); // Reload with animation
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts(); // Reload with animation
    }
  }
}

/**
 * HOW TO USE THIS EXAMPLE
 * =======================
 * 
 * 1. Copy this file to your dashboard component:
 *    src/app/features/admin/dashboard/dashboard.component.ts
 * 
 * 2. Import DashboardAnimationsService:
 *    import { DashboardAnimationsService } from '../shared/services/dashboard-animations.service';
 * 
 * 3. Make sure you have these CSS files in the same directory:
 *    - dashboard-animations.css
 *    - tables-animations.css
 * 
 * 4. Update your HTML template to use the animation triggers:
 *    @pageRevealAnimation - Main container
 *    @statsCardsAnimation - Stats grid
 *    @tableRowsAnimation - Table body
 *    @actionButtonPopAnimation - Action buttons
 * 
 * 5. Manage state in component methods:
 *    - onStatCardHover() - Handle card hover state
 *    - onRowHover() - Handle row hover state
 *    - onEditClick() - Handle button click animation
 * 
 * That's it! Your dashboard now has premium animations 🎉
 */
