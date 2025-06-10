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
    [Authorize(Roles = "Admin,SuperAdmin")]
    public class ReportsController : ControllerBase
    {
        private readonly MultiTenantTaskDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ReportsController(MultiTenantTaskDbContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        private int GetTenantId()
        {
            var claim = _httpContextAccessor.HttpContext?.User?.FindFirst("TenantId");
            return claim != null && int.TryParse(claim.Value, out var id) ? id : 0;
        }

        // ────────────── USER PRODUCTIVITY (Tenant-Scoped) ──────────────
        [HttpGet("user-productivity")]
        public async Task<IActionResult> GetUserProductivity()
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
