import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'category-form.component.html',
  styleUrls: ['category-form.component.css'],
})
export class CategoryFormComponent {
  name: string = '';
  message: string = '';

  constructor(private adminService: AdminService) {}

  addCategory() {
    const trimmedName = this.name.trim();
    if (!trimmedName) {
      this.message = 'Category name cannot be empty.';
      return;
    }

    this.adminService.createCategory(trimmedName).subscribe({
      next: () => {
        this.message = '✅ Category added successfully!';
        this.name = '';
      },
      error: () => {
        this.message = '❌ Failed to add category.';
      }
    });
  }
}
