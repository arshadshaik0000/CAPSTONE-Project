using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiTenantTaskManagementSystem.DTOs;
using MultiTenantTaskManagementSystem.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MultiTenantTaskManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly MultiTenantTaskDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TasksController(
            MultiTenantTaskDbContext context,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private int GetTenantId()
        {
            var claim = _httpContextAccessor.HttpContext?.User?.FindFirst("TenantId");
            return claim != null && int.TryParse(claim.Value, out var id) ? id : 0;
        }

        private int GetUserId()
        {
            var claim = _httpContextAccessor.HttpContext?.User?.FindFirst("UserId");
            return claim != null && int.TryParse(claim.Value, out var id) ? id : 0;
        }

        // ────────────── CREATE TASK (Tenant-Scoped) ──────────────
        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] TaskCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");

            // Validate Category & User
            bool validCategory = await _context.TaskCategories
                .AnyAsync(c => c.CategoryId == dto.CategoryId && c.TenantId == tenantId);
            bool validUser = await _context.Users
                .AnyAsync(u => u.UserId == dto.AssignedToUserId && u.TenantId == tenantId);

            if (!validCategory || !validUser)
                return BadRequest("Invalid category or assigned user for your tenant.");

            var task = new Models.Task
            {
                TenantId = tenantId,
                Title = dto.Title,
                Description = dto.Description,
                DueDate = dto.DueDate,
                Priority = dto.Priority,
                Status = dto.Status ?? "Pending",
                CategoryId = dto.CategoryId,
                AssignedToUserId = dto.AssignedToUserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTaskById), new { id = task.TaskId }, task);
        }

        // ────────────── GET TASK BY ID (Tenant-Scoped) ──────────────
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTaskById(int id)
        {
            int tenantId = GetTenantId();

            var task = await _context.Tasks
                .Where(t => t.TaskId == id && t.TenantId == tenantId)
                .Include(t => t.Category)
                .Include(t => t.AssignedToUser)
                .FirstOrDefaultAsync();

            if (task == null)
                return NotFound();

            return Ok(task);
        }

        // ────────────── GET ALL TASKS (Tenant-Scoped) ──────────────
        [HttpGet]
        public async Task<IActionResult> GetAllTasks()
        {
            int tenantId = GetTenantId();

            var tasks = await _context.Tasks
                .Where(t => t.TenantId == tenantId)
                .Include(t => t.AssignedToUser)
                .Include(t => t.Category)
                .ToListAsync();

            return Ok(tasks);
        }

        // ────────────── UPDATE TASK (Tenant-Scoped) ──────────────
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            int tenantId = GetTenantId();

            var task = await _context.Tasks.FindAsync(id);
            if (task == null || task.TenantId != tenantId)
                return NotFound("Task not found or does not belong to your tenant.");

            if (dto.Status != null)
                task.Status = dto.Status;
            if (dto.Priority.HasValue)
                task.Priority = dto.Priority.Value;
            if (dto.DueDate.HasValue)
                task.DueDate = dto.DueDate.Value;
            if (dto.CategoryId.HasValue)
                task.CategoryId = dto.CategoryId.Value;
            if (dto.AssignedToUserId.HasValue)
                task.AssignedToUserId = dto.AssignedToUserId.Value;

            _context.Tasks.Update(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ────────────── DELETE TASK (Tenant-Scoped) ──────────────
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            int tenantId = GetTenantId();

            var task = await _context.Tasks.FindAsync(id);
            if (task == null || task.TenantId != tenantId)
                return NotFound("Task not found or does not belong to your tenant.");

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ────────────── GET COMMENTS FOR A TASK ──────────────
        [HttpGet("{id}/comments")]
        public async Task<IActionResult> GetTaskComments(int id)
        {
            int tenantId = GetTenantId();

            var comments = await _context.TaskComments
                .Where(c => c.TaskId == id && c.Task.TenantId == tenantId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new
                {
                    c.CommentId,
                    c.TaskId,
                    c.CommentText,
                    c.CreatedAt,
                    c.CreatedByUserId,
                    CreatedByUsername = c.CreatedByUser != null ? c.CreatedByUser.Username : null
                })
                .ToListAsync();

            return Ok(comments);
        }

        // ────────────── ADD COMMENT TO TASK ──────────────
        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(int id, [FromBody] string commentText)
        {
            int userId = GetUserId();
            int tenantId = GetTenantId();

            var task = await _context.Tasks.FindAsync(id);
            if (task == null || task.TenantId != tenantId)
                return NotFound("Task not found or does not belong to your tenant.");

            var comment = new TaskComment
            {
                TaskId = id,
                CommentText = commentText,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            _context.TaskComments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Comment added successfully." });
        }

        // ────────────── APPROVE TASK (Tenant-Scoped) ──────────────
        [HttpPatch("{id}/approve")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> ApproveTask(int id, [FromBody] TaskApprovalDto dto)
        {
            if (dto == null || !dto.IsApproved)
                return BadRequest("To approve, IsApproved must be true.");

            int approverId = GetUserId();
            int tenantId = GetTenantId();

            var task = await _context.Tasks.FindAsync(id);
            if (task == null || task.TenantId != tenantId)
                return NotFound("Task not found or does not belong to your tenant.");

            task.IsApproved = true;
            task.ApprovedBy = approverId;
            _context.Tasks.Update(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ────────────── REVOKE TASK APPROVAL (Tenant-Scoped) ──────────────
        [HttpPatch("{id}/revoke")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> RevokeTask(int id)
        {
            int tenantId = GetTenantId();

            var task = await _context.Tasks.FindAsync(id);
            if (task == null || task.TenantId != tenantId)
                return NotFound("Task not found or does not belong to your tenant.");

            task.IsApproved = false;
            task.ApprovedBy = null;
            _context.Tasks.Update(task);
            await _context.SaveChangesAsync();

            return Ok("⛔ Task revoked");
        }

        // ────────────── GET RECENT COMMENTS BY CURRENT USER ──────────────
        [HttpGet("comments/recent")]
        public async Task<IActionResult> GetRecentComments()
        {
            int userId = GetUserId();
            int tenantId = GetTenantId();

            var comments = await _context.TaskComments
                .Where(c => c.CreatedByUserId == userId && c.Task.TenantId == tenantId)
                .OrderByDescending(c => c.CreatedAt)
                .Take(5)
                .Select(c => new
                {
                    c.CommentId,
                    c.TaskId,
                    c.CommentText,
                    c.CreatedAt,
                    c.CreatedByUserId,
                    UserName = c.CreatedByUser.Username
                })
                .ToListAsync();

            return Ok(comments);
        }
        // ────────────── GET MY TASKS (Personal view) ──────────────
        [HttpGet("my-tasks")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetMyTasks()
        {
            int userId = GetUserId();
            int tenantId = GetTenantId();

            var tasks = await _context.Tasks
                .Where(t => t.TenantId == tenantId && t.AssignedToUserId == userId)
                .Include(t => t.Category)
                .Include(t => t.AssignedToUser)
                .ToListAsync();

            return Ok(tasks);
        }
        // ────────────── USER PRODUCTIVITY STATS ──────────────
        [HttpGet("stats/user-productivity")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> GetUserProductivityStats()
        {
            int tenantId = GetTenantId();
            if (tenantId == 0)
                return Unauthorized("Tenant ID missing");

            var stats = await _context.Users
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
