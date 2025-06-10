import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, TaskCategory } from '../../services/admin.service';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css'],
})
export class CategoryManagementComponent implements OnInit {
  categories: TaskCategory[] = [];
  newCategory = '';
  editingCategoryId: number | null = null;
  editingCategoryName = '';
  loading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.adminService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: () => {
        alert('Failed to load categories');
        this.loading = false;
      }
    });
  }

  addCategory(): void {
    if (!this.newCategory.trim()) return;

    this.adminService.createCategory(this.newCategory.trim()).subscribe({
      next: () => {
        this.newCategory = '';
        this.loadCategories();
      },
      error: () => alert('Failed to add category')
    });
  }

  editCategory(category: TaskCategory): void {
    this.editingCategoryId = category.categoryId;
    this.editingCategoryName = category.name;
  }

  saveCategory(): void {
    if (!this.editingCategoryName.trim()) return;

    this.adminService.updateCategory(this.editingCategoryId!, this.editingCategoryName.trim()).subscribe({
      next: () => {
        this.editingCategoryId = null;
        this.editingCategoryName = '';
        this.loadCategories();
      },
      error: () => alert('Failed to update category')
    });
  }

  cancelEdit(): void {
    this.editingCategoryId = null;
    this.editingCategoryName = '';
  }

deleteCategory(id: number): void {
  if (!confirm('Delete this category?')) return;

  this.adminService.deleteCategory(id).subscribe({
    next: () => {
      this.categories = this.categories.filter(c => c.categoryId !== id);
    },
    error: (err) => {
      alert(err.error?.message || 'Failed to delete category');
    }
  });
}

}
