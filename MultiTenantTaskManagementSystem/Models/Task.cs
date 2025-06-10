using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MultiTenantTaskManagementSystem.Models
{
    public partial class Task
    {
        public int TaskId { get; set; }

        public int TenantId { get; set; }

        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        public DateTime? DueDate { get; set; }

        public int? Priority { get; set; }

        public string? Status { get; set; }

        public int? CategoryId { get; set; }

        public int? AssignedToUserId { get; set; }

        public DateTime? CreatedAt { get; set; }

        public bool? IsApproved { get; set; }

        public int? ApprovedBy { get; set; }

        [ForeignKey("ApprovedBy")]
        public virtual User? ApprovedByUser { get; set; }

        public virtual User? AssignedToUser { get; set; }

        public virtual TaskCategory? Category { get; set; }

        public virtual ICollection<TaskComment> TaskComments { get; set; } = new List<TaskComment>();

        public virtual Department Tenant { get; set; } = null!;
    }
}
