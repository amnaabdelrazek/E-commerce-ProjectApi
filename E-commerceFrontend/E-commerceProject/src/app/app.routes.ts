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
import {CartComponent} from './features/cart-component/cart-component'
import { CheckoutCpmponent } from './features/checkout-cpmponent/checkout-cpmponent';
import { ProfileComponent } from './features/profile/profile.component';
import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { adminGuard } from './core/guards/admin.guard';

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
      {path:'checkout', component:CheckoutCpmponent},
      {path: 'cart', component: CartComponent},
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
      {
        path: 'lighting',
        component: CategoryProductsComponent,
        data: { title: 'Lighting', categoryName: 'Lighting' }
      },
      { path: 'products/:id', component: ProductDetailsComponent },
      { path: 'profile', component: ProfileComponent },
      {
        path: 'forgot-password',
        component: PlaceholderComponent,
        data: {
          title: 'Forgot Password',
          description: 'Password reset flow is not connected yet, but you can still sign in, register, or return to shopping.',
          primaryLabel: 'Back to Login',
          primaryLink: '/login',
          secondaryLabel: 'Create Account',
          secondaryLink: '/register'
        }
      },
      {
        path: 'orders',
        component: PlaceholderComponent,
        data: {
          title: 'Orders',
          description: 'Your order history endpoint is not connected yet. You can continue shopping or review your profile information.',
          primaryLabel: 'Go to Shop',
          primaryLink: '/shop',
          secondaryLabel: 'Open Profile',
          secondaryLink: '/profile'
        }
      },
      {
        path: 'wishlist',
        component: PlaceholderComponent,
        data: {
          title: 'Wishlist',
          description: 'Wishlist data is not available yet. Browse products and save your favorite picks manually for now.',
          primaryLabel: 'Browse Products',
          primaryLink: '/shop',
          secondaryLabel: 'Back Home',
          secondaryLink: '/home'
        }
      }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: PlaceholderComponent, data: { title: 'Products' } },
      { path: 'categories', component: PlaceholderComponent, data: { title: 'Categories' } },
      { path: 'orders', component: PlaceholderComponent, data: { title: 'Orders' } },
      { path: 'users', component: PlaceholderComponent, data: { title: 'Users' } }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
