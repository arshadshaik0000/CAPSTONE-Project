import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-role-redirect',
  standalone: true,
  template: `<p>Redirecting...</p>`
})
export class RoleRedirectComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  constructor() {
    const role = this.authService.getUserRole();

    if (role === 'Admin') {
      this.router.navigate(['/admin-dashboard']);
    } else if (role === 'SuperAdmin') {
      this.router.navigate(['/superadmin-dashboard']);
    } else {
      this.router.navigate(['/user-dashboard']);
    }
  }
}
