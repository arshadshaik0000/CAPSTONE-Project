import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Task, TaskComment, TaskCreateDto } from '../models/task.model';
import { UserProductivity } from '../models/user-productivity.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly baseUrl = 'https://localhost:7134/api/Tasks';

  // ────────────── TASK CRUD ──────────────

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl);
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  updateTaskStatus(id: number, status: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, { status });
  }

  createTask(dto: TaskCreateDto): Observable<Task> {
    const body = {
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate).toISOString() : null
    };
    return this.http.post<Task>(this.baseUrl, body);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  approveTask(taskId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${taskId}/approve`, { isApproved: true });
  }

  revokeTask(taskId: number) {
    return this.http.patch(`https://localhost:7134/api/Tasks/${taskId}/approve`, { isApproved: false });
  }

  // ────────────── COMMENTS ──────────────

  getCommentsByTaskId(taskId: number): Observable<TaskComment[]> {
    return this.http.get<TaskComment[]>(`${this.baseUrl}/${taskId}/comments`);
  }

  addCommentToTask(taskId: number, commentText: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${taskId}/comments`, { commentText });
  }

  // ────────────── PRODUCTIVITY REPORT ──────────────

  getUserProductivityStats(): Observable<UserProductivity[]> {
    return this.http.get<UserProductivity[]>(`${this.baseUrl}/stats/user-productivity`);
  }

  getUserProductivity(): Observable<UserProductivity[]> {
    return this.getUserProductivityStats();
  }

  constructor(private http: HttpClient) {}
}

/** Alias for chart component usage */
export type UserProductivityStats = UserProductivity;
