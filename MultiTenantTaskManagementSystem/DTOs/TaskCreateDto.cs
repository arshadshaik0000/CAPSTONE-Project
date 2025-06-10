using System;
using System.ComponentModel.DataAnnotations;

namespace MultiTenantTaskManagementSystem.DTOs
{
    public class TaskCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        public string? Description { get; set; }

        [Required]
        public DateTime? DueDate { get; set; }

        [Range(1, 3, ErrorMessage = "Priority must be 1 (High), 2 (Medium), or 3 (Low).")]
        public int? Priority { get; set; }

        public string? Status { get; set; } = "Pending";

        [Required]
        public int? CategoryId { get; set; }

        [Required]
        public int AssignedToUserId { get; set; }
    }
}
