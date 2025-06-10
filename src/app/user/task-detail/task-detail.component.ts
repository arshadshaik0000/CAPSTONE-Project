import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { TaskComment } from '../../models/task.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-detail.component.html'
})
export class TaskDetailComponent implements OnInit {
  @Input() taskId!: number;
  @Input() canPost: boolean = true;


  comments: TaskComment[] = [];
  newComment: string = '';
  loading = false;
  error = '';
  success = '';

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    if (this.taskId) {
      this.fetchComments();
    }
  }

  fetchComments(): void {
    this.loading = true;
    this.error = '';
    this.taskService.getCommentsByTaskId(this.taskId).subscribe({
      next: (data) => {
        this.comments = data;
        this.loading = false;
      },
      error: () => {
        this.error = '❌ Failed to load comments';
        this.loading = false;
      }
    });
  }

  addComment(): void {
    this.error = '';
    this.success = '';

    const text = this.newComment.trim();
    if (!text) return;

    this.taskService.addCommentToTask(this.taskId, text).subscribe({
      next: () => {
        this.success = '✅ Comment added';
        this.newComment = '';
        this.fetchComments();
      },
      error: () => {
        this.error = '❌ Failed to add comment';
      }
    });
  }
}
