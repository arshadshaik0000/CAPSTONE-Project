import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, TaskCategory } from '../../services/admin.service';
import Swal from 'sweetalert2';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'category-list.component.html',
  styleUrls: ['category-list.component.css'],
})
export class CategoryListComponent implements OnInit {
  categories: TaskCategory[] = [];
  newName: string = '';
  editingId: number | null = null;

  constructor(
    private adminService: AdminService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.adminService.getCategories().subscribe({
      next: (data) => (this.categories = data),
      error: () => Swal.fire('Error', 'Failed to fetch categories', 'error'),
    });
  }

  startEdit(category: TaskCategory) {
    this.editingId = category.categoryId;
    this.newName = category.name;
  }

  cancelEdit() {
    this.editingId = null;
    this.newName = '';
  }

  updateCategory(id: number) {
    if (!this.newName.trim()) return;

    this.adminService.updateCategory(id, this.newName).subscribe({
      next: () => {
        this.loadCategories();
        this.cancelEdit();
        Swal.fire({
          title: 'Updated',
          text: 'Category updated successfully',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      },
      error: () => Swal.fire('Error', 'Failed to update category', 'error'),
    });
  }

  async deleteCategory(id: number) {
    const confirmed = await this.confirmService.show('Are you sure you want to delete this category?');
    if (!confirmed) return;

    this.adminService.deleteCategory(id).subscribe({
      next: () => {
        this.loadCategories();
        Swal.fire({
          title: 'Deleted',
          text: 'Category deleted successfully',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      },
      error: () => Swal.fire('Error', 'Failed to delete category', 'error'),
    });
  }
}
