export interface Task {
  taskId: number;
  title: string;
  description: string;
  status: 'Pending' | 'To Do' | 'In Progress' | 'Completed'; // ✅ Added 'Pending'
  priority: number; // 1 = High, 2 = Medium, 3 = Low
  dueDate: string;
  categoryId: number;
  assignedToUserId: number;
  isApproved?: boolean;      // ✅ Optional approval status
  approvedBy?: number;       // ✅ Optional approver ID
}

export interface TaskComment {
  commentId: number;
  taskId: number;
  commentText: string;
  createdByUserId: number;
  createdAt: string;
  createdByUser?: {
  username: string;
  };
  
}
export interface TaskCreateDto {
  title: string;
  description?: string;
  dueDate?: string | Date;   // ISO string or Date; both bind fine in ASP.NET
  priority?: number | null;  // 1-High, 2-Medium, 3-Low
  status?: string;           // default "Pending"
  categoryId: number;
  assignedToUserId: number;
}

