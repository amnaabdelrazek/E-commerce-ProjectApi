import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaypalService } from '../../../core/services/paypal.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paypalService = inject(PaypalService);
  private notification = inject(NotificationService);

  orderId: number | null = null;

  ngOnInit(): void {

    const idParam = this.route.snapshot.queryParamMap.get('orderId');

    if (!idParam) {
      this.notification.error('Missing order ID');
      this.router.navigate(['/checkout']);
      return;
    }

    this.orderId = Number(idParam);

    if (isNaN(this.orderId) || this.orderId <= 0) {
      this.notification.error('Invalid order ID');
      this.router.navigate(['/checkout']);
      return;
    }

    this.createPayPalPayment();
  }

  createPayPalPayment() {
    this.notification.info('Redirecting to PayPal...');

    this.paypalService.createPayment(this.orderId!).subscribe({
      next: (res) => {

        if (res?.url) {
          window.location.href = res.url;
        } else {
          this.notification.error('Invalid PayPal response');
        }

      },
      error: () => {
        this.notification.error('Failed to start PayPal payment.');
      }
    });
  }
}