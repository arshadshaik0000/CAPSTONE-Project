namespace MultiTenantTaskManagementSystem.DTOs
{
    public class TaskDto
    {
        public int TaskId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public int? Priority { get; set; }
        public string Status { get; set; } = "Pending";
        public int AssignedToUserId { get; set; }
        public int CategoryId { get; set; }
        public int TenantId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}