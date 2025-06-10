import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// ---------- Interfaces ----------
export interface Department {
  departmentId: number;
  name: string;
  description: string;
}

export interface AdminUser {
  userId: number;
  username: string;
  tenantId: number;
  department: string;
  role: string;
  email: string;
}

export interface AppUser {
  userId: number;
  name: string;
  email: string;
  role: string;
}

export interface DepartmentStatsDto {
  departmentId: number;
  name: string;
  userCount: number;
  taskCount: number;
  completedCount: number;
  inProgressCount: number;
  toDoCount: number;
}

export interface DashboardSummary {
  totalDepartments: number;
  totalAdmins: number;
  totalUsers: number;
}

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {
  private baseUrl = 'https://localhost:7134/api/SuperAdmin';

  constructor(private http: HttpClient) {}

  // 🔐 Get token headers dynamically
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ---------- Department Methods ----------
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/departments`, {
      headers: this.getAuthHeaders()
    });
  }

  createDepartment(payload: { name: string; description: string }) {
    return this.http.post(`${this.baseUrl}/departments`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  updateDepartment(id: number, payload: { name: string; description: string }) {
    return this.http.put(`${this.baseUrl}/departments/${id}`, {
      departmentId: id,
      ...payload
    }, {
      headers: this.getAuthHeaders()
    });
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/departments/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ---------- Admin Methods ----------
  getAdmins(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/admins`, {
      headers: this.getAuthHeaders()
    });
  }

  createAdmin(admin: { username: string; passwordHash: string; tenantId: number }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/admins`, admin, {
      headers: this.getAuthHeaders()
    });
  }

  deleteAdmin(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admins/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Fixed: Send role name instead of roleId
  updateAdminRole(userId: number, role: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/admins/${userId}/role`, { role }, {
      headers: this.getAuthHeaders()
    });
  }

  // ---------- Task & User Overview ----------
  getAllTasks(): Observable<any[]> {
    return this.http.get<any[]>('https://localhost:7134/api/Tasks', {
      headers: this.getAuthHeaders()
    });
  }

  getAllUsers(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(`${this.baseUrl}/users`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Department Stats for Super Admin Dashboard
  getDepartmentStats(): Observable<DepartmentStatsDto[]> {
    return this.http.get<DepartmentStatsDto[]>(`${this.baseUrl}/dashboard/overview`, {
      headers: this.getAuthHeaders()
    });
  }

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard-summary`, {
      headers: this.getAuthHeaders()
    });
  }

  getUnapprovedTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tasks/unapproved`, {
      headers: this.getAuthHeaders()
    });
  }

  approveTask(taskId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/tasks/${taskId}/approve`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  getUnapprovedCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories/unapproved`, {
      headers: this.getAuthHeaders()
    });
  }

  approveCategory(categoryId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/categories/${categoryId}/approve`, {}, {
      headers: this.getAuthHeaders()
    });
  }
}
