import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private toastIdCounter = 0;

  constructor(private ngZone: NgZone) {}

  success(message: string, duration: number = 3000): void {
    this.addToast(message, 'success', duration);
  }

  error(message: string, duration: number = 4000): void {
    this.addToast(message, 'error', duration);
  }

  info(message: string, duration: number = 3000): void {
    this.addToast(message, 'info', duration);
  }

  private addToast(message: string, type: 'success' | 'error' | 'info', duration: number): void {
    const id = `toast-${++this.toastIdCounter}`;
    const toast: Toast = { id, message, type, duration };

    // Always run inside Angular's zone to ensure change detection is triggered
    this.ngZone.run(() => {
      const currentToasts = this.toastsSubject.value;
      this.toastsSubject.next([...currentToasts, toast]);
    });

    if (duration > 0) {
      // Run the timeout outside Angular's zone to avoid unnecessary change detection
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          // Run back inside Angular's zone only when removing the toast
          this.ngZone.run(() => this.removeToast(id));
        }, duration);
      });
    }
  }

  removeToast(id: string): void {
    this.ngZone.run(() => {
      const currentToasts = this.toastsSubject.value;
      this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
    });
  }
}
