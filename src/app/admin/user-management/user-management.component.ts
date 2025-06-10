import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser } from '../../services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  users: AdminUser[] = [];
  loading = false;

  newUser = {
    username: '',
    passwordHash: '',
    roleId: 2 // Default to User
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('❌ Failed to load users', '', 'error');
      }
    });
  }

  createUser(): void {
    const { username, passwordHash, roleId } = this.newUser;

    if (!username.trim() || !passwordHash.trim()) {
      Swal.fire('⚠️ Missing Fields', 'Username and password are required.', 'warning');
      return;
    }

    this.adminService.createUser({ username, passwordHash, roleId }).subscribe({
      next: () => {
        Swal.fire('✅ User created successfully', '', 'success');
        this.newUser = { username: '', passwordHash: '', roleId: 2 };
        this.fetchUsers();
      },
      error: (err) => {
        Swal.fire('❌ Failed to create user', err.error?.message || '', 'error');
      }
    });
  }

  deleteUser(userId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the user.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteUser(userId).subscribe({
        next: (res) => {
          Swal.fire('✅ User deleted successfully', res?.message || '', 'success');
          this.users = this.users.filter(u => u.userId !== userId);
        },

          error: (err) => {
            Swal.fire('❌ Failed to delete user', err.error?.message || '', 'error');
          }
        });
      }
    });
  }
}
