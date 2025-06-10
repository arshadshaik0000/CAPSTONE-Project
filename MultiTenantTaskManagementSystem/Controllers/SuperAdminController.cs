using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiTenantTaskManagementSystem.DTOs;
using MultiTenantTaskManagementSystem.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using BCrypt.Net;

namespace MultiTenantTaskManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "SuperAdmin")]
    public class SuperAdminController : ControllerBase
    {
        private readonly MultiTenantTaskDbContext _dbContext;

        public SuperAdminController(MultiTenantTaskDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ────────────── DEPARTMENTS ──────────────

        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments()
        {
            var departments = await _dbContext.Departments
                .Select(d => new
                {
                    d.DepartmentId,
                    d.Name,
                    d.Description,
                    d.CreatedAt
                })
                .ToListAsync();

            return Ok(departments);
        }

        [HttpPost("departments")]
        public async Task<IActionResult> CreateDepartment([FromBody] DepartmentCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Department name is required.");

            var department = new Department
            {
                Name = dto.Name.Trim(),
                Description = dto.Description?.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Departments.Add(department);
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                department.DepartmentId,
                department.Name,
                department.Description,
                department.CreatedAt
            });
        }

        [HttpPut("departments/{id}")]
        public async Task<IActionResult> UpdateDepartment(int id, [FromBody] DepartmentCreateDto dto)
        {
            var department = await _dbContext.Departments.FindAsync(id);
            if (department == null)
                return NotFound("Department not found.");

            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Department name is required.");

            department.Name = dto.Name.Trim();
            department.Description = dto.Description?.Trim();

            _dbContext.Departments.Update(department);
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                department.DepartmentId,
                department.Name,
                department.Description,
                department.CreatedAt
            });
        }

        [HttpDelete("departments/{id}")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var department = await _dbContext.Departments.FindAsync(id);
            if (department == null)
                return NotFound("Department not found.");

            _dbContext.Departments.Remove(department);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        // ────────────── ADMINS ──────────────

        [HttpPost("admins")]
        public async Task<IActionResult> AddAdmin([FromBody] AdminCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.PasswordHash))
                return BadRequest("Username and password are required.");

            // Ensure department exists
            bool deptExists = await _dbContext.Departments
                .AnyAsync(d => d.DepartmentId == dto.TenantId);
            if (!deptExists)
                return BadRequest("Invalid department ID.");

            bool usernameExists = await _dbContext.Users
                .AnyAsync(u => u.Username == dto.Username.Trim());
            if (usernameExists)
                return BadRequest("Username already exists.");

            // Find the “Admin” role
            var role = await _dbContext.Roles
                .FirstOrDefaultAsync(r => r.RoleName == "Admin");
            if (role == null)
                return BadRequest("Admin role not found.");

            // Hash the password
            string hashed = BCrypt.Net.BCrypt.HashPassword(dto.PasswordHash.Trim());

            var user = new User
            {
                Username = dto.Username.Trim(),
                PasswordHash = hashed,
                Email = dto.Email?.Trim(),
                TenantId = dto.TenantId,
                RoleId = role.RoleId,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            // Return basic info
            return Ok(new AdminResponseDto
            {
                UserId = user.UserId,
                Username = user.Username,
                TenantId = user.TenantId,
                Role = role.RoleName
            });
        }

        [HttpGet("admins")]
        public async Task<IActionResult> GetAdmins()
        {
            var admins = await _dbContext.Users
                .Where(u => u.Role.RoleName == "Admin")
                .Include(u => u.Role)
                .Include(u => u.Tenant)
                .Select(u => new AdminViewDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email,
                    TenantId = u.TenantId,
                    Department = u.Tenant.Name,
                    Role = u.Role.RoleName
                })
                .ToListAsync();

            return Ok(admins);
        }

        [HttpDelete("admins/{id}")]
        public async Task<IActionResult> DeleteAdmin(int id)
        {
            var user = await _dbContext.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == id && u.Role.RoleName == "Admin");

            if (user == null)
                return NotFound("Admin not found.");

            _dbContext.Users.Remove(user);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("admins/{id}/role")]
        public async Task<IActionResult> UpdateAdminRole(int id, [FromBody] AdminUpdateRoleDto dto)
        {
            var user = await _dbContext.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
                return NotFound("User not found.");

            var newRole = await _dbContext.Roles
                .FirstOrDefaultAsync(r => r.RoleName == dto.Role);
            if (newRole == null)
                return BadRequest("Invalid role.");

            user.RoleId = newRole.RoleId;
            _dbContext.Users.Update(user);
            await _dbContext.SaveChangesAsync();

            return Ok(new { Message = "Role updated successfully." });
        }

        // ────────────── USERS ──────────────

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _dbContext.Users
                .AsNoTracking()
                .Include(u => u.Role)
                .ToListAsync();

            var result = users
                .Select(u => new AdminResponseDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    TenantId = u.TenantId,
                    Role = u.Role.RoleName,
                    Email = u.Email
                })
                .ToList();

            return Ok(result);
        }

        // ────────────── DASHBOARD OVERVIEW ──────────────
        [HttpGet("dashboard/overview")]
        public async Task<IActionResult> GetDepartmentOverview()
        {
            var stats = await _dbContext.Departments
                .Select(d => new DepartmentStatsDto
                {
                    DepartmentId = d.DepartmentId,
                    Name = d.Name,
                    UserCount = d.Users.Count(),
                    TaskCount = d.Users.SelectMany(u => u.Tasks).Count(),
                    CompletedCount = d.Users.SelectMany(u => u.Tasks).Count(t => t.Status == "Completed"),
                    InProgressCount = d.Users.SelectMany(u => u.Tasks).Count(t => t.Status == "In Progress"),
                    ToDoCount = d.Users.SelectMany(u => u.Tasks).Count(t => t.Status == "To Do")
                })
                .OrderBy(d => d.Name)
                .ToListAsync();

            return Ok(stats);
        }

        [HttpPatch("categories/{id}/approve")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> ApproveCategory(int id)
        {
            var category = await _dbContext.TaskCategories.FindAsync(id);
            if (category == null)
                return NotFound("Category not found.");

            category.IsApproved = true;
            _dbContext.TaskCategories.Update(category);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
        [HttpGet("stats/department")]
        public async Task<IActionResult> GetDepartmentStats()
        {
            return await GetDepartmentOverview();
        }

        [HttpGet("dashboard-summary")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            int totalDepartments = await _dbContext.Departments.CountAsync();
            int totalAdmins = await _dbContext.Users
                .CountAsync(u => u.Role.RoleName == "Admin");
            int totalUsers = await _dbContext.Users
                .CountAsync(u => u.Role.RoleName == "User");

            return Ok(new
            {
                totalDepartments,
                totalAdmins,
                totalUsers
            });
        }
    }
}
