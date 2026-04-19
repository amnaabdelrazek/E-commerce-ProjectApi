import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();

  console.log('GUARD USER:', user);

  if (!user || !user.role) {
    router.navigate(['/login']);
    return false;
  }

  const isAdmin = user.role.some(
    r => (r ?? '').toLowerCase() === 'admin'
  );

  console.log('IS ADMIN:', isAdmin);

  if (isAdmin) return true;
console.log('GUARD RUNNING:', state.url);
  if (!user) {
  return router.createUrlTree(['/login']);
}
  return false;
};
