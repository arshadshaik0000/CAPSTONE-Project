// src/app/superadmin/category-approval.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { SuperAdminService } from '../services/super-admin.service';

@Component({
  selector: 'app-category-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-approval.component.html'
})
export class CategoryApprovalComponent implements OnInit {
  categories: { categoryId: number; name: string; tenantId: number; isApproved: boolean }[] = [];
  isLoading = false;

  constructor(private superAdminService: SuperAdminService) {}

  ngOnInit(): void {
    this.fetchPendingCategories();
  }

  fetchPendingCategories(): void {
    this.isLoading = true;
    this.superAdminService.getUnapprovedCategories().subscribe({
      next: (res: any[]) => {
        this.categories = res;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching categories', err);
        this.isLoading = false;
      }
    });
  }

  approveCategory(categoryId: number): void {
    Swal.fire({
      title: 'Approve Category?',
      text: 'This will make the category available for use.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Approve',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.superAdminService.approveCategory(categoryId).subscribe({
          next: () => {
            Swal.fire('Approved', 'Category approved successfully.', 'success');
            this.categories = this.categories.filter(c => c.categoryId !== categoryId);
          },
          error: (err: any) => {
            console.error('Approval failed', err);
            Swal.fire('Error', 'Failed to approve category.', 'error');
          }
        });
      }
    });
  }
}
