// src/app/shared/forbidden.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-5 text-center">
      <h1 class="display-4 text-danger">403 - Forbidden</h1>
      <p class="lead">You don’t have permission to access this page.</p>
      <a routerLink="/" class="btn btn-primary">Return to Dashboard</a>
    </div>
  `
})
export class ForbiddenComponent {}
