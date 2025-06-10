using System;
using System.Collections.Generic;

namespace MultiTenantTaskManagementSystem.Models;

public partial class Department
{
    public int DepartmentId { get; set; }       //Tenant Id

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<TaskCategory> TaskCategories { get; set; } = new List<TaskCategory>();

    public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
