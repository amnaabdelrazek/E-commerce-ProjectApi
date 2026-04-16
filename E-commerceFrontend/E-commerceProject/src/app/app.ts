import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

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
  protected readonly title = signal('E-commerceProject');
}
