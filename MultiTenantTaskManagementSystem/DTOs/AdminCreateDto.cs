namespace MultiTenantTaskManagementSystem.DTOs
{
    public class AdminCreateDto
    {
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public int TenantId { get; set; }
        public string Email { get; set; }

    }
}
