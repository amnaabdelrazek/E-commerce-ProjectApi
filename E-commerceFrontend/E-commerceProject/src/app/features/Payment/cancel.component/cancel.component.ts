import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cancel',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="cancel-container">
      <h2>Payment Cancelled ❌</h2>

      <p>Your payment was not completed.</p>

      <a routerLink="/checkout" class="back-link">
        ← Back to Checkout
      </a>
    </div>
  `,
  styleUrls: ['./cancel.component.css']
})
export class CancelComponent {}