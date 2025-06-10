import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center mt-5">
      <h1 class="text-danger">404 - Page Not Found</h1>
      <p>The page you are looking for doesn’t exist.</p>
    </div>
  `
})
export class NotFoundComponent {}
