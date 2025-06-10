using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiTenantTaskManagementSystem.DTOs;
using MultiTenantTaskManagementSystem.Models;
using System.Linq;
using System.Threading.Tasks;

namespace MultiTenantTaskManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // All endpoints require authentication
    public class UsersController : ControllerBase
    {
        private readonly MultiTenantTaskDbContext _dbContext;

        public UsersController(MultiTenantTaskDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        private int GetTenantId() =>
            int.TryParse(User.FindFirst("TenantId")?.Value, out var id) ? id : 0;

        // GET USERS (Tenant‐Scoped)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUsers()
        {
            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");

            var users = await _dbContext.Users
                .Where(u => u.TenantId == tenantId)
                .Include(u => u.Role)
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.Email,
                    u.RoleId,
                    Role = u.Role.RoleName,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET USER BY ID (Tenant‐Scoped)
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserById(int id)
        {
            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");

            var user = await _dbContext.Users
                .Where(u => u.UserId == id && u.TenantId == tenantId)
                .Include(u => u.Role)
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.Email,
                    u.RoleId,
                    Role = u.Role.RoleName,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        // CREATE USER (Tenant‐Scoped) – plain‐text password
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] UserCreateDto dto)
        {
            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");

            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.PasswordHash))
                return BadRequest("Username and password are required.");

            bool usernameExists = await _dbContext.Users
                .AnyAsync(u => u.Username == dto.Username.Trim());
            if (usernameExists)
                return BadRequest("Username already exists.");

            var user = new User
            {
                Username = dto.Username.Trim(),
                PasswordHash = dto.PasswordHash,   // Plain‐text
                Email = null,
                TenantId = tenantId,
                RoleId = dto.RoleId,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserById), new { id = user.UserId }, new
            {
                user.UserId,
                user.Username,
                user.Email,
                user.RoleId,
                user.TenantId,
                user.CreatedAt
            });
        }

        // UPDATE USER (Tenant‐Scoped) – plain‐text password
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateDto dto)
        {
            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");

            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.UserId == id && u.TenantId == tenantId);
            if (user == null)
                return NotFound("User not found or does not belong to your tenant.");

            user.Username = dto.Username.Trim();
            user.RoleId = dto.RoleId;
            if (!string.IsNullOrWhiteSpace(dto.PasswordHash))
            {
                user.PasswordHash = dto.PasswordHash;   // Plain‐text
            }

            _dbContext.Users.Update(user);
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                user.UserId,
                user.Username,
                user.Email,
                user.RoleId,
                user.TenantId,
                user.CreatedAt
            });
        }

        // DELETE USER (Tenant‐Scoped)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");

            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.UserId == id && u.TenantId == tenantId);
            if (user == null)
                return NotFound("User not found or does not belong to your tenant.");

            _dbContext.Users.Remove(user);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
