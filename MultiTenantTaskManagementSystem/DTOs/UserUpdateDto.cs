namespace MultiTenantTaskManagementSystem.DTOs
{
    public class UserUpdateDto
    {
        public string Username { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public int RoleId { get; set; }
    }
}
