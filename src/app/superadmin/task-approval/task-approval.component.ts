// src/app/superadmin/task-approval/task-approval.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { SuperAdminService } from '../../services/super-admin.service';

@Component({
  selector: 'app-task-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-approval.component.html'
})
export class TaskApprovalComponent implements OnInit {
  pendingTasks: {
    taskId: number;
    title: string;
    assignedToUserId: number;
    status: string;
    priority: string;
    dueDate: string;
    tenantId: number;
  }[] = [];

  isLoading = false;

  constructor(private superAdminService: SuperAdminService) {}

  ngOnInit(): void {
    this.fetchPendingTasks();
  }

  fetchPendingTasks(): void {
    this.isLoading = true;
    this.superAdminService.getUnapprovedTasks().subscribe({
      next: (res) => {
        this.pendingTasks = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching tasks', err);
        this.isLoading = false;
      }
    });
  }

  approveTask(taskId: number): void {
    Swal.fire({
      title: 'Approve Task?',
      text: 'This will allow the task to be active.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Approve',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.superAdminService.approveTask(taskId).subscribe({
          next: () => {
            Swal.fire('Approved', 'Task approved successfully.', 'success');
            this.pendingTasks = this.pendingTasks.filter(t => t.taskId !== taskId);
          },
          error: (err) => {
            console.error('Approval failed', err);
            Swal.fire('Error', 'Failed to approve task.', 'error');
          }
        });
      }
    });
  }
}
