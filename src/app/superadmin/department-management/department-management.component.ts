// src/app/superadmin/department-management/department-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { SuperAdminService } from '../../services/super-admin.service';

@Component({
  selector: 'app-department-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './department-management.component.html'
})
export class DepartmentManagementComponent implements OnInit {
  departments: { departmentId: number; name: string; description: string }[] = [];

  name = '';
  description = '';
  isLoading = false;
  isEditing = false;
  editId: number | null = null;

  constructor(private superAdminService: SuperAdminService) {}

  ngOnInit(): void {
    this.fetchDepartments();
  }

  fetchDepartments(): void {
    this.isLoading = true;
    this.superAdminService.getDepartments().subscribe({
      next: (res) => {
        this.departments = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching departments', err);
        this.isLoading = false;
      }
    });
  }

  submitDepartment(): void {
    if (!this.name || !this.description) {
      Swal.fire('Validation Error', 'All fields are required.', 'warning');
      return;
    }

    const payload = { name: this.name, description: this.description };

    if (this.isEditing && this.editId !== null) {
      this.superAdminService.updateDepartment(this.editId, payload).subscribe({
        next: () => {
          Swal.fire('Updated', 'Department updated successfully.', 'success');
          this.resetForm();
          this.fetchDepartments();
        },
        error: (err) => {
          console.error('Update failed', err);
          Swal.fire('Error', 'Failed to update department.', 'error');
        }
      });
    } else {
      this.superAdminService.createDepartment(payload).subscribe({
        next: () => {
          Swal.fire('Created', 'Department added successfully.', 'success');
          this.resetForm();
          this.fetchDepartments();
        },
        error: (err) => {
          console.error('Create failed', err);
          Swal.fire('Error', 'Failed to add department.', 'error');
        }
      });
    }
  }

  editDepartment(dept: any): void {
    this.name = dept.name;
    this.description = dept.description;
    this.editId = dept.departmentId;
    this.isEditing = true;
  }

  confirmDelete(deptId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the department.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteDepartment(deptId);
      }
    });
  }

  deleteDepartment(deptId: number): void {
    this.superAdminService.deleteDepartment(deptId).subscribe({
      next: () => {
        Swal.fire('Deleted', 'Department deleted.', 'success');
        this.fetchDepartments();
      },
      error: (err) => {
        console.error('Delete failed', err);
        Swal.fire('Error', 'Failed to delete department.', 'error');
      }
    });
  }

  resetForm(): void {
    this.name = '';
    this.description = '';
    this.isEditing = false;
    this.editId = null;
  }
}
