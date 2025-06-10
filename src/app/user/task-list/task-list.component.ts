import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import Swal from 'sweetalert2';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, NgxChartsModule, TaskDetailComponent],
  templateUrl: './task-list.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedStatus: 'To Do' | 'In Progress' | 'Completed' | '' = '';
  selectedPriority: number | '' = '';
  sortAsc: boolean = true;
  searchTerm: string = '';
  isLoading: boolean = true;
  expandedTaskId: number | null = null;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.fetchTasks();
  }

  fetchTasks(): void {
    this.isLoading = true;
    this.taskService.getAllTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.filteredTasks = [...data];
        this.isLoading = false;
        Swal.fire('✅ Success', 'Tasks loaded successfully!', 'success');
      },
      error: () => {
        Swal.fire('❌ Error', 'Failed to load tasks.', 'error');
        this.isLoading = false;
      }
    });
  }

  toggleComments(taskId: number): void {
    this.expandedTaskId = this.expandedTaskId === taskId ? null : taskId;
  }

  sortByDueDate(): void {
    this.sortAsc = !this.sortAsc;
    this.filteredTasks.sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return this.sortAsc ? dateA - dateB : dateB - dateA;
    });
  }

  updateStatus(task: Task, newStatus: 'To Do' | 'In Progress' | 'Completed'): void {
    this.taskService.updateTaskStatus(task.taskId, newStatus).subscribe({
      next: () => {
        task.status = newStatus;
        Swal.fire('✅ Updated', `Task status updated to "${newStatus}"`, 'success');
      },
      error: () => {
        Swal.fire('❌ Error', 'Failed to update task status.', 'error');
      }
    });
  }

  getPriorityColor(priority: number): string {
    switch (priority) {
      case 1: return 'danger';
      case 2: return 'warning';
      case 3: return 'success';
      default: return 'secondary';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'To Do': return 'secondary';
      case 'In Progress': return 'primary';
      case 'Completed': return 'success';
      default: return 'dark';
    }
  }

  get taskSummary() {
    return {
      total: this.filteredTasks.length,
      completed: this.filteredTasks.filter(t => t.status === 'Completed').length,
      inProgress: this.filteredTasks.filter(t => t.status === 'In Progress').length,
      toDo: this.filteredTasks.filter(t => t.status === 'To Do').length,
    };
  }

  searchTasks(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredTasks = this.tasks.filter(task =>
      (this.selectedStatus === '' || task.status === this.selectedStatus) &&
      (this.selectedPriority === '' || task.priority === this.selectedPriority) &&
      (task.title.toLowerCase().includes(term) || task.description.toLowerCase().includes(term))
    );
  }

  filterTasks(): void {
    this.searchTasks();
  }

  get statusChartData() {
    return [
      { name: 'To Do', value: this.filteredTasks.filter(t => t.status === 'To Do').length },
      { name: 'In Progress', value: this.filteredTasks.filter(t => t.status === 'In Progress').length },
      { name: 'Completed', value: this.filteredTasks.filter(t => t.status === 'Completed').length },
    ];
  }

  getTaskProgress(task: Task): number {
    switch (task.status) {
      case 'To Do': return 33;
      case 'In Progress': return 66;
      case 'Completed': return 100;
      default: return 0;
    }
  }
}
