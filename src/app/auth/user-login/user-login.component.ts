import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-login.component.html'
})
export class UserLoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getUserRole();
      this.authService.redirectToDashboardByRole(role ?? 'User');
    }
  }

  login(): void {
    this.loading = true;
    this.error = '';

    this.authService.loginUser(this.email, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role || 'User');
        localStorage.setItem('username', res.username);
        localStorage.setItem('tenantId', res.tenantId?.toString() || '');

        Swal.fire({
          icon: 'success',
          title: '✅ Login Successful',
          showConfirmButton: false,
          timer: 1500
        });

        this.authService.redirectToDashboardByRole(res.role);
      },
      error: () => {
        this.error = '❌ Invalid credentials';
        this.loading = false;
      }
    });
  }

  loginWithMicrosoft(): void {
    this.authService.loginWithMicrosoft$().subscribe({
      next: () => {},
      error: () => {
        Swal.fire({
          icon: 'error',
          title: '❌ Microsoft Login Failed',
          text: 'Something went wrong. Please try again.'
        });
      }
    });
  }
}
