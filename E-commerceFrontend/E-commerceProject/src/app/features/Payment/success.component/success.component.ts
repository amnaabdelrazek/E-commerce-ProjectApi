import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaypalService } from '../../../core/services/paypal.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-success',
  template: `<h2>Processing payment...</h2>`
})
export class PaymentSuccessComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    private paypal: PaypalService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {

    const paymentId = this.route.snapshot.queryParamMap.get('paymentId')!;
    const payerId = this.route.snapshot.queryParamMap.get('PayerID')!;

    this.paypal.executePayment(paymentId, payerId)
      .subscribe({
        next: () => {
          this.notification.success('Payment successful ✅');

          this.router.navigate(['/orders']);
        },
        error: () => {
          this.notification.error('Payment failed ❌');
        }
      });
  }
}