import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MsalService } from '@azure/msal-angular';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';

// Angular & Material modules
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ]
})
export class LandingPageComponent implements OnInit {
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private msalService: MsalService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    this.iconRegistry.addSvgIcon(
      'microsoft',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://cdn.jsdelivr.net/npm/simple-icons@9.18.0/icons/microsoft.svg'
      )
    );
  }
  ngOnInit(): void {
    this.loading = true;
    this.msalService.instance.handleRedirectPromise()
      .then(result => {
        const account = result?.account ?? this.msalService.instance.getAllAccounts()[0];
        if (account) {
          this.msalService.instance.setActiveAccount(account);

          this.authService.loginWithMicrosoft$().subscribe({
            next: res => {
              const role = res.role || 'User';
              Swal.fire({
                icon: 'success',
                title: '✅ Login successful!',
                timer: 1500,
                showConfirmButton: false
              });
              this.authService.redirectToDashboardByRole(role);
            },
            error: () => {
              Swal.fire({
                icon: 'error',
                title: '❌ Login failed',
                text: 'Microsoft account is not registered.'
              });
            }
          });
        }
        this.loading = false;
      })
      .catch(err => {
        console.error('MSAL handleRedirect error', err);
        Swal.fire({
          icon: 'error',
          title: '❌ Authentication failed',
          text: 'Please try again later.'
        });
        this.loading = false;
      });
  }

  loginAsUser(): void {
    this.error = '';
    this.loading = true;

    const isInteractionInProgress =
      this.msalService.instance.getActiveAccount() ||
      sessionStorage.getItem('msal.interaction.status') === 'interaction_in_progress';

    if (isInteractionInProgress) {
      console.warn('MSAL interaction already in progress.');
      Swal.fire({
        icon: 'warning',
        title: '⚠️ Login already in progress',
        timer: 1500,
        showConfirmButton: false
      });
      this.loading = false;
      return;
    }
    this.msalService.loginRedirect();
  }

  navigateToAdminLogin(): void {
    this.router.navigate(['/admin-login']);
  }

  navigateToUserLogin(): void {
    this.router.navigate(['/user-login']);
  }
}
