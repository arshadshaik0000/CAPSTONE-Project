// src/app/superadmin/admin-management/admin-management.component.ts

import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { SuperAdminService } from '../../services/super-admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminResponseDto } from '../../models/admin-response.model';

@Component({
  selector: 'app-admin-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-management.component.html'
})
export class AdminManagementComponent implements OnInit {
  admins: AdminResponseDto[] = [];
  username = '';
  email = '';
  password = '';
  departmentId: number | null = null;
  departments: { departmentId: number; name: string }[] = [];

  isLoading = false;

  constructor(private superAdminService: SuperAdminService) {}

  ngOnInit(): void {
    this.fetchAdmins();
    this.fetchDepartments();
  }

  fetchAdmins(): void {
    this.isLoading = true;
    this.superAdminService.getAdmins().subscribe({
      next: (res) => {
        this.admins = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching admins', err);
        this.isLoading = false;
      }
    });
  }

  fetchDepartments(): void {
    this.superAdminService.getDepartments().subscribe({
      next: (res) => {
        this.departments = res;
      },
      error: (err) => {
        console.error('Error fetching departments', err);
      }
    });
  }

  createAdmin(): void {
    if (!this.username || !this.password || !this.email || !this.departmentId) {
      Swal.fire('Validation Error', 'All fields are required.', 'warning');
      return;
    }

    const payload = {
      username: this.username,
      passwordHash: this.password,
      email: this.email,
      tenantId: this.departmentId
    };

    this.superAdminService.createAdmin(payload).subscribe({
      next: () => {
        Swal.fire('Success', 'Admin created successfully.', 'success');
        this.username = '';
        this.email = '';
        this.password = '';
        this.departmentId = null;
        this.fetchAdmins();
      },
      error: (err) => {
        console.error('Error creating admin', err);
        Swal.fire('Error', 'Failed to create admin.', 'error');
      }
    });
  }

  confirmDelete(adminId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the admin user.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteAdmin(adminId);
      }
    });
  }

  deleteAdmin(adminId: number): void {
    this.superAdminService.deleteAdmin(adminId).subscribe({
      next: () => {
        this.admins = this.admins.filter(a => a.userId !== adminId);
        Swal.fire('Deleted', 'Admin has been removed.', 'success');
      },
      error: (err) => {
        console.error('Delete failed', err);
        Swal.fire('Error', 'Failed to delete admin.', 'error');
      }
    });
  }

  confirmRoleUpdate(admin: AdminResponseDto): void {
    const newRole = admin.role === 'Admin' ? 'User' : 'Admin';

    Swal.fire({
      title: 'Change Role',
      text: `Current role: ${admin.role}. Switch to ${newRole}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.superAdminService.updateAdminRole(admin.userId, newRole).subscribe({
          next: () => {
            admin.role = newRole;
            Swal.fire('Updated', 'Role updated successfully.', 'success');
          },
          error: (err) => {
            console.error('Role update failed', err);
            Swal.fire('Error', 'Failed to update role.', 'error');
          }
        });
      }
    });
  }
}
