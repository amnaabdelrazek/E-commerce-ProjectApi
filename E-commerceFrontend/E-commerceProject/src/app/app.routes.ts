import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ConfirmEmailComponent } from './features/auth/confirm-email/confirm-email.component';
import { PlaceholderComponent } from './shared/pages/placeholder/placeholder.component';
import { HomeComponent } from './features/home/home.component';
import { ProductsComponent } from './features/products/products.component';
import { CategoryProductsComponent } from './features/products/category-products/category-products.component';
import { ProductDetailsComponent } from './features/products/product-details/product-details.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'confirm-email', component: ConfirmEmailComponent },
      { path: 'home', component: HomeComponent },
      { path: 'shop', component: ProductsComponent },
      {
        path: 'furniture',
        component: CategoryProductsComponent,
        data: { title: 'Furniture', categoryName: 'Furniture' }
      },
      {
        path: 'decor',
        component: CategoryProductsComponent,
        data: { title: 'Decor', categoryName: 'Decor' }
      },
      { path: 'lighting', component: PlaceholderComponent, data: { title: 'Lighting' } },
      { path: 'products/:id', component: ProductDetailsComponent },
      { path: 'forgot-password', component: PlaceholderComponent, data: { title: 'Forgot Password' } },
      { path: 'orders', component: PlaceholderComponent, data: { title: 'Orders' } },
      { path: 'wishlist', component: PlaceholderComponent, data: { title: 'Wishlist' } }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
