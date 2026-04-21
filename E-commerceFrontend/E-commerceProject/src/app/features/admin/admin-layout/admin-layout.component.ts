import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  sidebarOpen: boolean = true;
  userName: string = '';
  pageTitle: string = 'Admin Dashboard';
  private subscription = new Subscription();

  get profileRoute(): string {
    return '/admin/profile';
  }

  get userInitial(): string {
    return this.userName.trim().charAt(0).toUpperCase() || 'A';
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.userName || user.email || 'Admin';
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

    this.pageTitle = current?.snapshot.data['title'] || 'Admin Dashboard';
  }
}
