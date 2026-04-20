import { Component, DestroyRef, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, User } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RealtimeService } from '../../../core/services/realtime.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private realtimeService = inject(RealtimeService);
  private destroyRef = inject(DestroyRef);

  users: User[] = [];
  filteredUsers: User[] = [];

  isLoading = false;
  hasLoadedOnce = false;
  errorMessage = '';

  // pagination
  page = 1;
  pageSize = 8;

  // search
  search = '';

  // role modal
  selectedUser: User | null = null;
  newRole = '';
  showRoleModal = false;

  ngOnInit(): void {
    this.loadUsers();

    this.realtimeService.adminUsersChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadUsers();
      });
  }

  // ================= LOAD USERS =================
  loadUsers(): void {
    this.isLoading = true;

    this.adminService.getUsers().subscribe({
      next: (res: any) => {
        this.users = Array.isArray(res) ? res : [];
        this.applyFilter();

        this.isLoading = false;
        this.hasLoadedOnce = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Failed to load users');
        this.users = [];
        this.filteredUsers = [];
        this.isLoading = false;
      }
    });
  }

  // ================= FILTER =================
  applyFilter(): void {
    let data = [...this.users];

    if (this.search?.trim()) {
      const s = this.search.toLowerCase();

      data = data.filter(u =>
        u.fullName?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s)
      );
    }

    this.filteredUsers = data;
    this.page = 1;
  }

  // ================= PAGINATION =================
  get paginated(): User[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }

  next(): void {
    if (this.page < this.totalPages) this.page++;
  }

  prev(): void {
    if (this.page > 1) this.page--;
  }

  // ================= SEARCH =================
  searchUsers(): void {
    this.applyFilter();
  }

  clearSearch(): void {
    this.search = '';
    this.applyFilter();
  }

  // ================= SOFT DELETE =================
  deleteUser(user: User): void {
    if (!confirm(`Delete ${user.fullName}?`)) return;

    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.notificationService.success('User deleted successfully');
        this.loadUsers();
      },
      error: () => {
        this.notificationService.error('Failed to delete user');
      }
    });
  }

  // ================= LOCK / UNLOCK =================
  toggleLock(user: User): void {
    const req = user.isLocked
      ? this.adminService.unlockUser(user.id)
      : this.adminService.lockUser(user.id);

    req.subscribe({
      next: () => {
        this.notificationService.success(
          user.isLocked ? 'User unlocked' : 'User locked'
        );
        this.loadUsers();
      },
      error: () => {
        this.notificationService.error('Failed to update status');
      }
    });
  }

  // ================= ROLE MODAL =================
  openRoleModal(user: User): void {
    this.selectedUser = user;
    this.newRole = user.role;
    this.showRoleModal = true;
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.selectedUser = null;
  }

  changeRole(): void {
    if (!this.selectedUser) return;

    this.adminService.changeUserRole(this.selectedUser.id, this.newRole)
      .subscribe({
        next: () => {
          this.notificationService.success('Role updated successfully');
          this.closeRoleModal();
          this.loadUsers();
        },
        error: () => {
          this.notificationService.error('Failed to update role');
        }
      });
  }

  trackByUserId(_: number, user: User): string {
    return user.id;
  }
}
