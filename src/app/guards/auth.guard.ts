import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const expectedRoles = route.data?.['roles'] as string[] | undefined;

  // ✅ Allow if token is present and user role matches allowed roles
  if (token && userRole && (!expectedRoles || expectedRoles.includes(userRole))) {
    return true;
  }

  // ❌ If role mismatch or not logged in, redirect based on fallback
  if (userRole === 'Admin') {
    return router.parseUrl('/admin/dashboard');
  } else if (userRole === 'User') {
    return router.parseUrl('/user/dashboard');
  } else if (userRole === 'SuperAdmin') {
    return router.parseUrl('/superadmin/dashboard');
  } else {
    return router.parseUrl('/'); // Default to landing page
  }
};
