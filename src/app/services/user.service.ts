import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task {
  taskId: number;
  title: string;
  description: string;
  status: 'Pending' | 'To Do' | 'In Progress' | 'Completed';
  priority: number;
  dueDate: string;
  categoryId: number;
  assignedToUserId: number;
  isApproved?: boolean;
  approvedBy?: number;
}

export interface TaskComment {
  commentId: number;
  taskId: number;
  commentText: string;
  createdByUserId: number;
  createdAt: string;
  
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = 'https://localhost:7134/api';

  constructor(private http: HttpClient) {}

  // 🧾 Get all tasks assigned to current user
  getUserTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/Tasks`);
  }

  // ✅ Update task status, priority, or description
  updateTaskStatus(task: Task): Observable<any> {
    const dto = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate
    };
    return this.http.patch(`${this.baseUrl}/Tasks/${task.taskId}`, dto);
  }

  // 💬 Get recent comments for the current user's tasks
  getRecentComments(): Observable<TaskComment[]> {
    return this.http.get<TaskComment[]>(`${this.baseUrl}/Tasks/comments/recent`);
  }
  // 👤 Get current user's details
getUserDetails(): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/Auth/user-info`);
}

}
