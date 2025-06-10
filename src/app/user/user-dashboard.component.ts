import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { Task } from '../models/task.model';


interface TaskComment {
  commentId: number;
  taskId: number;
  commentText: string;
  createdByUserId: number;
  createdAt: string;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: 'user-dashboard.component.html'
})
export class UserDashboardComponent implements OnInit {
  userName = '';
  role = 'User';
  department = '';

  tasks: Task[] = [];
  recentComments: TaskComment[] = [];

  totalTasks = 0;
  completedTasks = 0;
  pendingTasks = 0;
  overdueTasks = 0;

  loading = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loading = true;

    this.userService.getUserDetails().subscribe((user: any) => {
      this.userName = user.username;
      this.department = user.departmentName;
    });

    this.userService.getUserTasks().subscribe((tasks: Task[]) => {
      this.tasks = tasks;
      this.totalTasks = tasks.length;
      this.completedTasks = tasks.filter(t => t.status === 'Completed').length;
      this.pendingTasks = tasks.filter(t => t.status === 'Pending').length;
      this.overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;
    });

    this.userService.getRecentComments().subscribe((comments: TaskComment[]) => {
      this.recentComments = comments;
      this.loading = false;
    });
  }
}
