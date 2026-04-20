import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-seller-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './seller-layout.component.html',
  styleUrls: [
    './seller-layout.component.css',
    './seller-layout-modern.css',
    '../seller-animations.css'
  ]
})
export class SellerLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  sidebarOpen: boolean = true;
  userName: string = '';
  pageTitle: string = 'Seller Dashboard';
  private subscription = new Subscription();

  get profileRoute(): string {
    return '/seller/profile';
  }

  get userInitial(): string {
    return this.userName.trim().charAt(0).toUpperCase() || 'S';
  }

  ngOnInit(): void {
    this.sidebarOpen = window.innerWidth > 768;
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.userName || user.email || 'Seller';
    }

    this.updatePageTitle();
    this.subscription.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
        this.updatePageTitle();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  private updatePageTitle(): void {
    let current = this.route.firstChild;

    while (current?.firstChild) {
      current = current.firstChild;
    }

    this.pageTitle = current?.snapshot.data['title'] || 'Seller Dashboard';
  }
}
