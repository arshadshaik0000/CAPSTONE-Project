import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
})
export class AdminLoginComponent {
  title = 'Admin';
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  // ✅ Standard Login (Email + Password)
  login(): void {
    this.loading = true;
    this.error = '';

    this.http.post<any>('https://localhost:7134/api/Auth/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        localStorage.setItem('username', res.username);
        localStorage.setItem('tenantId', res.tenantId);

        Swal.fire({
          icon: 'success',
          title: '✅ Login successful',
          timer: 1500,
          showConfirmButton: false
        });

        this.authService.redirectToDashboardByRole(res.role);
      },
      error: () => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: '❌ Invalid credentials',
          text: 'Please check your email and password.'
        });
      }
    });
  }

  // ✅ Microsoft Login using AuthService
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
