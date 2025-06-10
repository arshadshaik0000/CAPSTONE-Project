namespace MultiTenantTaskManagementSystem.DTOs
{
    public class DepartmentStatsDto
    {
        public int DepartmentId { get; set; }
        public string Name { get; set; }
        public int UserCount { get; set; }
        public int TaskCount { get; set; }
        public int CompletedCount { get; set; }
        public int InProgressCount { get; set; }
        public int ToDoCount { get; set; }
    }
}
