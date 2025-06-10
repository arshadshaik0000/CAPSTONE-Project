using System;
using System.Collections.Generic;

namespace MultiTenantTaskManagementSystem.Models
{
    public partial class TaskCategory
    {
        public int CategoryId { get; set; }

        public int TenantId { get; set; }

        public string Name { get; set; } = null!;

        public bool IsApproved { get; set; } = false;

        public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();

        public virtual Department Tenant { get; set; } = null!;
    }
}
