namespace MultiTenantTaskManagementSystem.DTOs
{
    public class TaskWithUserDto
    {
        public int TaskId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int? AssignedToUserId { get; set; }
        public string? AssignedToUserUsername { get; set; }
        public string? Status { get; set; }
        public DateTime? DueDate { get; set; }
        public int? Priority { get; set; }
    }
}
