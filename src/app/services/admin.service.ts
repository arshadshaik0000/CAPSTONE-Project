import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// ----------- App User Model (Used in UI) -----------
export interface AppUser {
  userId: number;
  username: string;
  email: string;
  role: string;
}

// ----------- Admin User Model (Raw API result) -----------
export interface AdminUser {
  userId: number;
  username: string;
  email: string;
  department: string;
  role: string;
  roleId: number;
}

// ----------- Category Model -----------
export interface TaskCategory {
  categoryId: number;
  name: string;
}

// ----------- Task Model -----------
export interface DepartmentTask {
  taskId: number;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  priority: number;
  dueDate: string;
  categoryId: number;
  assignedToUserId: number;
  isApproved?: boolean;
  approvedBy?: string | null;
  user?: {
    username: string;
    email: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private baseUrl = 'https://localhost:7134/api';

  constructor(private http: HttpClient) {}

  /**
   * Returns a new HttpHeaders object with the latest token.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ✅ USERS (department-specific)
  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(
      `${this.baseUrl}/Admin/users`,
      { headers: this.getAuthHeaders() }
    );
  }

  createUser(user: { username: string; passwordHash: string; roleId: number }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/Admin/users`,
      user,
      { headers: this.getAuthHeaders() }
    );
  }

deleteUser(userId: number): Observable<{ message: string }> {
  return this.http.delete<{ message: string }>(`${this.baseUrl}/users/${userId}`, {
    headers: this.getAuthHeaders()
  });
}


  // ✅ CATEGORIES
  getCategories(): Observable<TaskCategory[]> {
    return this.http.get<TaskCategory[]>(
      `${this.baseUrl}/Admin/categories`,
      { headers: this.getAuthHeaders() }
    );
  }

  createCategory(name: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/Admin/categories`,
      { name },
      { headers: this.getAuthHeaders() }
    );
  }

  updateCategory(id: number, name: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/Admin/categories/${id}`,
      { name },
      { headers: this.getAuthHeaders() }
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/Admin/categories/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ TASKS
  getDepartmentTasks(): Observable<DepartmentTask[]> {
    return this.http.get<DepartmentTask[]>(
      `${this.baseUrl}/Tasks`,
      { headers: this.getAuthHeaders() }
    );
  }

  createTask(task: {
    title: string;
    description: string;
    priority: number;
    dueDate: string;
    categoryId: number;
    assignedToUserId: number;
    status: 'To Do' | 'In Progress' | 'Completed';
  }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/Tasks`,
      task,
      { headers: this.getAuthHeaders() }
    );
  }

  updateTask(taskId: number, payload: any): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/Tasks/${taskId}`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  assignTaskToUser(taskId: number, userId: number): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/Tasks/${taskId}`,
      { assignedToUserId: userId },
      { headers: this.getAuthHeaders() }
    );
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/Tasks/${taskId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Combined approve/revoke method:
   * - If approve === true, calls PATCH /api/Tasks/{taskId}/approve with { isApproved: true }
   * - If approve === false, calls PATCH /api/Tasks/{taskId}/revoke with an empty body
   */
  approveTask(taskId: number, approve: boolean): Observable<any> {
    if (approve) {
      return this.http.patch(
        `${this.baseUrl}/Tasks/${taskId}/approve`,
        { isApproved: true },
        { headers: this.getAuthHeaders() }
      );
    } else {
      return this.http.patch(
        `${this.baseUrl}/Tasks/${taskId}/revoke`,
        {},
        { headers: this.getAuthHeaders() }
      );
    }
  }

  // ✅ REPORTING
  getUserProductivityStats(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/Tasks/stats/user-productivity`,
      { headers: this.getAuthHeaders() }
    );
  }
}
