namespace MultiTenantTaskManagementSystem.DTOs
{
    public class UserProductivityDto
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int InProgressTasks { get; set; }
        public int ToDoTasks { get; set; }
    }
}
