import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { TokenStorageService } from '../../../core/services/token-storage.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);

  @Input({ required: true }) product!: Product;

  readonly placeholder = '/product-placeholder.svg';

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    img.src = this.placeholder;
  }

  onAddToCart(event: Event) {
    event.stopPropagation();
    const token = this.tokenStorage.getToken();
    if (!token) {
      void this.router.navigate(['/login']);
      return;
    }
    // TODO: integrate add-to-cart API when available.
  }
}
