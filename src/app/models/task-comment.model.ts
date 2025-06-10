// src/app/models/task-comment.model.ts

export interface TaskComment {
  commentId: number;
  taskId: number;
  userName: string;
  message: string;
  createdAt: string;
   // ISO format
}
