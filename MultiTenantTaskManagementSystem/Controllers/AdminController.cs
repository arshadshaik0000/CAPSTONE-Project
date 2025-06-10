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
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly MultiTenantTaskDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AdminController(
            MultiTenantTaskDbContext dbContext,
            IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        private int GetTenantId() =>
            int.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirst("TenantId")?.Value, out var id)
                ? id
                : 0;

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");
            try
            {
                var users = await _dbContext.Users
                    .Where(u => u.TenantId == tenantId)
                    .Include(u => u.Role)
                    .AsNoTracking()
                    .ToListAsync();

                var result = users.Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.Email,
                    u.RoleId,
                    Role = u.Role.RoleName
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error loading users.", Error = ex.Message });
            }
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] UserCreateDto dto)
        {
            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");

            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.PasswordHash))
                return BadRequest("Username and password are required.");

            if (await _dbContext.Users.AnyAsync(u => u.Username == dto.Username && u.TenantId == tenantId))
                return BadRequest("Username already exists.");

            try
            {
                var user = new User
                {
                    Username = dto.Username.Trim(),
                    PasswordHash = dto.PasswordHash.Trim(),
                    TenantId = tenantId,
                    RoleId = dto.RoleId,
                    CreatedAt = System.DateTime.UtcNow
                };

                _dbContext.Users.Add(user);
                await _dbContext.SaveChangesAsync();
                return Ok(new { Message = "User created successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error creating user.", Error = ex.Message });
            }
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserCreateDto dto)
        {
            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");

            try
            {
                var user = await _dbContext.Users.FindAsync(id);
                if (user == null || user.TenantId != tenantId)
                    return NotFound();

                user.Username = dto.Username.Trim();
                user.RoleId = dto.RoleId;
                user.PasswordHash = dto.PasswordHash.Trim();

                await _dbContext.SaveChangesAsync();
                return Ok(new { Message = "User updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error updating user.", Error = ex.Message });
            }
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");

            var currentUserId = int.TryParse(User.FindFirst("UserId")?.Value, out var uid) ? uid : 0;

            try
            {
                var user = await _dbContext.Users.FindAsync(id);
                if (user == null || user.TenantId != tenantId)
                    return NotFound("User not found or does not belong to your department.");

                if (user.UserId == currentUserId)
                    return BadRequest("You cannot delete your own account.");

                if (user.RoleId == 2)
                    return BadRequest("Admins cannot delete other Admins.");

                _dbContext.Users.Remove(user);
                await _dbContext.SaveChangesAsync();
                return Ok(new { Message = "User deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error deleting user.", Error = ex.Message });
            }
        }


        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");

            try
            {
                var categories = await _dbContext.TaskCategories
                    .Where(c => c.TenantId == tenantId && c.IsApproved == true)
                    .AsNoTracking()
                    .ToListAsync();

                var result = categories.Select(c => new { c.CategoryId, c.Name });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error loading categories.", Error = ex.Message });
            }
        }

        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryCreateDto dto)
        {
            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");

            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Category name is required.");

            try
            {
                var category = new TaskCategory
                {
                    Name = dto.Name.Trim(),
                    TenantId = tenantId
                };
                _dbContext.TaskCategories.Add(category);
                await _dbContext.SaveChangesAsync();
                return Ok(new { Message = "Category added successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error creating category.", Error = ex.Message });
            }
        }

        [HttpPut("categories/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryCreateDto dto)
        {
            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");

            var category = await _dbContext.TaskCategories.FindAsync(id);
            if (category == null || category.TenantId != tenantId)
                return NotFound("Category not found or does not belong to your tenant.");

            category.Name = dto.Name.Trim();
            await _dbContext.SaveChangesAsync();
            return Ok(new { Message = "Category updated successfully." });
        }

        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");

            bool hasTasks = await _dbContext.Tasks
                .AnyAsync(t => t.CategoryId == id && t.TenantId == tenantId);
            if (hasTasks)
                return BadRequest(new { Message = "Cannot delete category: tasks are assigned to it." });

            var category = await _dbContext.TaskCategories.FindAsync(id);
            if (category == null || category.TenantId != tenantId)
                return NotFound("Category not found or does not belong to your tenant.");
            _dbContext.TaskCategories.Remove(category);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("reports/status-summary")]
        public async Task<IActionResult> GetStatusSummaryForDepartment()
        {
            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");
            var summary = await _dbContext.Tasks
                .Where(t => t.TenantId == tenantId)
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    Completed = g.Count(t => t.Status == "Completed"),
                    InProgress = g.Count(t => t.Status == "In Progress"),
                    ToDo = g.Count(t => t.Status == "To Do")
                })
                .FirstOrDefaultAsync();
            return Ok(summary ?? new { Completed = 0, InProgress = 0, ToDo = 0 });
        }

        [HttpGet("stats/user-productivity")]
        public async Task<IActionResult> GetUserProductivityStats()
        {
            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");

            var stats = await _dbContext.Users
                .Where(u => u.TenantId == tenantId)
                .Select(u => new UserProductivityDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    TotalTasks = u.Tasks.Count(),
                    CompletedTasks = u.Tasks.Count(t => t.Status == "Completed"),
                    InProgressTasks = u.Tasks.Count(t => t.Status == "In Progress"),
                    ToDoTasks = u.Tasks.Count(t => t.Status == "To Do")
                })
                .OrderBy(u => u.Username)
                .ToListAsync();
            return Ok(stats);
        }
    }
}
