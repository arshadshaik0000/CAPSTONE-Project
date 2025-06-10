import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, DepartmentTask, AdminUser, TaskCategory } from '../../services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.css'],
})
export class TaskManagementComponent implements OnInit {
  tasks: DepartmentTask[] = [];
  users: AdminUser[] = [];
  categories: TaskCategory[] = [];
  loading = false;

  statuses: ('To Do' | 'In Progress' | 'Completed')[] = ['To Do', 'In Progress', 'Completed'];

  newTask = {
    title: '',
    description: '',
    priority: 1,
    dueDate: '',
    categoryId: 0,
    assignedToUserId: 0,
    status: 'To Do' as 'To Do' | 'In Progress' | 'Completed'
  };

  selectedTaskId: number | null = null;
  selectedUserId: number | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.fetchTasks();
    this.adminService.getUsers().subscribe((users) => (this.users = users));
    this.adminService.getCategories().subscribe((cats) => (this.categories = cats));
  }

  fetchTasks(): void {
    this.loading = true;
    this.adminService.getDepartmentTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('❌ Failed to load tasks', '', 'error');
      }
    });
  }

  createTask(): void {
    const t = this.newTask;
    if (!t.title || !t.description || !t.dueDate || !t.categoryId || !t.assignedToUserId) {
      Swal.fire('⚠️ All fields are required', 'Please fill in every field before creating a task.', 'warning');
      return;
    }

    const taskPayload = {
      ...t,
      priority: Number(t.priority),
      categoryId: Number(t.categoryId),
      assignedToUserId: Number(t.assignedToUserId)
    };

    this.adminService.createTask(taskPayload).subscribe({
      next: () => {
        Swal.fire('✅ Task created', '', 'success');
        this.fetchTasks();
        this.newTask = { title: '', description: '', priority: 1, dueDate: '', categoryId: 0, assignedToUserId: 0, status: 'To Do' };
      },
      error: () => {
        Swal.fire('❌ Failed to create task', 'Please try again.', 'error');
      }
    });
  }

  updateStatus(taskId: number, newStatus: string): void {
    this.adminService.updateTask(taskId, { status: newStatus }).subscribe({
      next: () => {
        Swal.fire('✅ Status updated', '', 'success');
        this.fetchTasks();
      },
      error: () => {
        Swal.fire('❌ Failed to update status', '', 'error');
      }
    });
  }

  deleteTask(taskId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the task.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteTask(taskId).subscribe({
          next: () => {
            Swal.fire('✅ Task deleted successfully', '', 'success');
            this.fetchTasks();
          },
          error: () => {
            Swal.fire('❌ Failed to delete task', '', 'error');
          }
        });
      }
    });
  }

  assignTask(): void {
    if (!this.selectedTaskId || !this.selectedUserId) {
      Swal.fire('⚠️ Missing Fields', 'Please select both a task and a user.', 'warning');
      return;
    }

    this.adminService.assignTaskToUser(this.selectedTaskId, this.selectedUserId).subscribe({
      next: () => {
        Swal.fire('✅ Task assigned successfully', '', 'success');
        this.fetchTasks();
        this.selectedTaskId = null;
        this.selectedUserId = null;
      },
      error: () => {
        Swal.fire('❌ Failed to assign task', '', 'error');
      }
    });
  }

  approveTask(taskId: number, approve: boolean): void {
    this.adminService.approveTask(taskId, approve).subscribe({
      next: () => {
        const task = this.tasks.find(t => t.taskId === taskId);
        if (task) task.isApproved = approve;

        Swal.fire({
          icon: 'success',
          title: approve ? '✅ Task Approved' : '⛔ Task Revoked',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: () => {
        Swal.fire('❌ Failed to update approval status', 'Please try again.', 'error');
      }
    });
  }
}
