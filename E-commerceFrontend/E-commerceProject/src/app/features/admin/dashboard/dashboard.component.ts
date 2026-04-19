import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, DashboardData } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { BaseChartDirective } from 'ng2-charts';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

interface DashboardCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  dashboardData: DashboardData | null = null;
  cards: DashboardCard[] = [];
  isLoading = false;

  barChartData: any = null;
  barChartOptions: any = null;

  pieChartData: any = null;
  pieChartOptions: any = null;

  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.initChartOptions();
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /* ================= LOAD ================= */

  private loadDashboard(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const sub = this.adminService.getDashboard().pipe(
      timeout(10000)
    ).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.dashboardData = res.data;
          this.initCards();
          this.initCharts(res.data);
        } else {
          this.notificationService.error(res.message || 'Failed to load dashboard');
        }

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        // fallback so UI doesn't break
        this.dashboardData = {
          totalUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalCoupons: 0
        };

        this.initCards();
        this.notificationService.error('Dashboard failed to load');

        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });

    this.subscriptions.add(sub);
  }

  /* ================= CARDS ================= */

  private initCards(): void {
    if (!this.dashboardData) return;

    this.cards = [
      {
        title: 'Total Users',
        value: this.dashboardData.totalUsers,
        icon: 'U',
        color: '#a26a3f'
      },
      {
        title: 'Total Orders',
        value: this.dashboardData.totalOrders,
        icon: 'O',
        color: '#6f4127'
      },
      {
        title: 'Total Revenue',
        value: `$${this.dashboardData.totalRevenue.toFixed(0)}`,
        icon: '$',
        color: '#b8860b'
      },
      {
        title: 'Total Coupons',
        value: this.dashboardData.totalCoupons,
        icon: 'C',
        color: '#d4af37'
      }
    ];
  }

  /* ================= CHART OPTIONS ================= */

  private initChartOptions(): void {
    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    this.pieChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };
  }

  /* ================= CHART DATA ================= */

  private initCharts(data: DashboardData): void {

    /* BAR CHART */
    if (data.topProducts?.length) {
      this.barChartData = {
        labels: data.topProducts.map(p => p.productName),
        datasets: [
          {
            label: 'Sales',
            data: data.topProducts.map(p => p.sales),
            backgroundColor: '#a26a3f',
            borderRadius: 6
          }
        ]
      };
    } else {
      this.barChartData = null;
    }

    /* PIE CHART */
    if (data.topBuyers?.length) {
      const colors = ['#a26a3f', '#6f4127', '#b8860b', '#d4af37', '#8b6f47'];

      this.pieChartData = {
        labels: data.topBuyers.map(b => b.name || 'Unknown'),
        datasets: [
          {
            data: data.topBuyers.map(b => Number(b.spent)),
            backgroundColor: colors.slice(0, data.topBuyers.length),
            borderWidth: 2
          }
        ]
      };
    } else {
      this.pieChartData = null;
    }
  }
}
