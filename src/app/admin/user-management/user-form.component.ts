import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'user-form.component.html',
  styleUrls: ['user-form.component.css'],
})
export class UserFormComponent {
  username: string = '';
  password: string = '';
  roleId: number = 2; // default to User

  constructor(private adminService: AdminService) {}

  submitForm() {
    const payload = {
      username: this.username,
      passwordHash: this.password,
      roleId: this.roleId
    };

    this.adminService.createUser(payload).subscribe({
      next: () => {
        alert('User created successfully');
        this.username = '';
        this.password = '';
        this.roleId = 2;
      },
      error: () => alert('Failed to create user')
    });
  }
}
