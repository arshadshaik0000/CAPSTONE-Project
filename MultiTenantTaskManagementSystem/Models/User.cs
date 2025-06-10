using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MultiTenantTaskManagementSystem.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Username { get; set; } = null!;

    public string? PasswordHash { get; set; }

    public string? Email { get; set; } = null;

    public int TenantId { get; set; }

    public int RoleId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Role Role { get; set; } = null!;

    public virtual ICollection<TaskComment> TaskComments { get; set; } = new List<TaskComment>();

    public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();

    public virtual Department Tenant { get; set; } = null!;
}
