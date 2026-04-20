import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { AuthService } from './core/services/auth.service';
import { RealtimeService } from './core/services/realtime.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, LoadingSpinnerComponent],
  template: `
    <router-outlet />
    <app-toast />
    <app-loading-spinner />
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100dvh;
      }
    `
  ]
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly realtimeService = inject(RealtimeService);
  protected readonly title = signal('E-commerceProject');

  constructor() {
    void this.realtimeService.syncConnection();

    effect(() => {
      this.authService.currentUser();
      void this.realtimeService.syncConnection();
    });
  }
}
