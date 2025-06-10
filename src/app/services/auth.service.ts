import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo } from '@azure/msal-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'https://localhost:7134/api/Auth';

  constructor(
    private msalService: MsalService,
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Microsoft Login with backend token exchange
   */
  loginWithMicrosoft$(): Observable<any> {
    return new Observable((observer) => {
      this.msalService.loginPopup().subscribe({
        next: (result) => {
          const account: AccountInfo | null = result.account;

          if (account?.username) {
            // Set as active account
            this.msalService.instance.setActiveAccount(account);

            // Post to backend to get JWT
            this.http.post(`${this.apiUrl}/login-microsoft`, {
              email: account.username
            }).subscribe({
              next: (res: any) => {
                localStorage.setItem('token', res.token);
                localStorage.setItem('role', res.role || 'User');
                localStorage.setItem('username', res.username);
                localStorage.setItem('tenantId', res.tenantId?.toString() || '');

                Swal.fire({
                  icon: 'success',
                  title: '✅ Microsoft login successful',
                  showConfirmButton: false,
                  timer: 1500
                });

                this.redirectToDashboardByRole(res.role);
                observer.next(res);
                observer.complete();
              },
              error: (err) => {
                console.error('Token retrieval failed:', err);
                Swal.fire({
                  icon: 'error',
                  title: '❌ Login failed',
                  text: 'Microsoft account is not registered.'
                });
                observer.error(err);
              }
            });
          } else {
            const msg = 'No Microsoft account found.';
            Swal.fire({
              icon: 'warning',
              title: '⚠️ Microsoft account missing',
              text: msg
            });
            observer.error(msg);
          }
        },
        error: (err) => {
          console.error('Microsoft Login Failed:', err);
          Swal.fire({
            icon: 'error',
            title: '❌ Microsoft login failed',
            text: 'Something went wrong.'
          });
          observer.error(err);
        }
      });
    });
  }

  /**
   * Logout using MSAL popup and clear all data
   */
  logout(): void {
    this.msalService.logoutPopup().subscribe({
      next: () => {
        localStorage.clear();
        Swal.fire({
          icon: 'info',
          title: 'Logged out successfully',
          timer: 1500,
          showConfirmButton: false
        });
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Logout failed:', err);
        localStorage.clear();
        Swal.fire({
          icon: 'warning',
          title: 'Logout failed',
          text: 'Session cleared anyway.'
        });
        this.router.navigate(['/']);
      }
    });
  }

  /**
   * Redirect to correct dashboard by role
   */
  redirectToDashboardByRole(role: string): void {
    switch (role) {
      case 'User':
        this.router.navigate(['/user-dashboard']);
        break;
      case 'Admin':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'SuperAdmin':
        this.router.navigate(['/superadmin-dashboard']);
        break;
      default:
        this.router.navigate(['/forbidden']);
    }
  }

  /**
   * Get current user's role
   */
  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

  /**
   * Get Microsoft account email
   */
  getUserEmail(): string | null {
    const account = this.msalService.instance.getActiveAccount();
    return account?.username ?? null;
  }

  /**
   * Check login status
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Traditional email/password login
   */
  loginUser(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  /**
   *  Get current user's name
   */
  getUsername(): string | null {
    return localStorage.getItem('username');
  }
}
