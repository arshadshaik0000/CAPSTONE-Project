using System;
using System.Collections.Generic;

namespace MultiTenantTaskManagementSystem.Models;

public partial class TaskComment
{
    public int CommentId { get; set; }

    public int TaskId { get; set; }

    public string? CommentText { get; set; }

    public int? CreatedByUserId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? CreatedByUser { get; set; }

    public virtual Task Task { get; set; } = null!;
}
