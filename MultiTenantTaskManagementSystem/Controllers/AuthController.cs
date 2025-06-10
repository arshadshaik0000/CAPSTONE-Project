using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiTenantTaskManagementSystem.DTOs;
using MultiTenantTaskManagementSystem.Helpers;
using MultiTenantTaskManagementSystem.Models;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MultiTenantTaskManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AuthController : ControllerBase
    {
        private readonly JwtTokenHelper _jwtTokenHelper;
        private readonly MultiTenantTaskDbContext _dbContext;

        public AuthController(JwtTokenHelper jwtTokenHelper, MultiTenantTaskDbContext dbContext)
        {
            _jwtTokenHelper = jwtTokenHelper;
            _dbContext = dbContext;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var email = dto.Email?.Trim().ToLower();
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest(new { message = "Email is required." });

            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

            if (user == null)
                return Unauthorized(new { message = "Invalid credentials" });

            // Plain‐text comparison:
            if (dto.Password != user.PasswordHash)
                return Unauthorized(new { message = "Invalid credentials" });

            var roleName = user.RoleId == 1
                ? "SuperAdmin"
                : user.RoleId == 2
                    ? "Admin"
                    : "User";

            var token = _jwtTokenHelper.GenerateToken(
                username: user.Username,
                tenantId: user.TenantId.ToString(),
                role: roleName,
                userId: user.UserId,
                email: user.Email
            );

            return Ok(new
            {
                token,
                role = roleName,
                username = user.Username,
                tenantId = user.TenantId
            });
        }

        [HttpPost("login-microsoft")]
        [AllowAnonymous]
        public async Task<IActionResult> LoginWithMicrosoft([FromBody] MicrosoftLoginDto dto)
        {
            var email = dto?.Email?.Trim().ToLower();
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest(new { Message = "Email is required." });

            var user = await _dbContext.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

            if (user == null)
            {
                var allowedDomains = new[] { "outlook.com", "example.in" };
                var domain = email.Split('@').Last();
                if (!allowedDomains.Contains(domain))
                    return Unauthorized(new { Message = "Domain not allowed." });

                var isSuper = email == "arshaduzzamashaik@outlook.com";
                var roleId = isSuper ? 1 : 3;    // if “you,” then SuperAdmin; otherwise regular User
                var tenantId = 99;

                user = new User
                {
                    Username = email.Split('@')[0],
                    Email = email,
                    TenantId = tenantId,
                    RoleId = roleId,
                    CreatedAt = DateTime.UtcNow,
                    PasswordHash = null
                };

                _dbContext.Users.Add(user);
                await _dbContext.SaveChangesAsync();
                await _dbContext.Entry(user).Reference(u => u.Role).LoadAsync();
            }
            else
            {
                if (!string.Equals(user.Email, email, StringComparison.Ordinal))
                {
                    user.Email = email;
                    _dbContext.Users.Update(user);
                    await _dbContext.SaveChangesAsync();
                }
            }

            var token = _jwtTokenHelper.GenerateToken(
                username: user.Username,
                tenantId: user.TenantId.ToString(),
                role: user.Role?.RoleName ?? "User",
                userId: user.UserId,
                email: user.Email
            );

            return Ok(new
            {
                Token = token,
                Username = user.Username,
                Role = user.Role?.RoleName,
                TenantId = user.TenantId
            });
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var username = User.Identity?.Name ?? User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(username))
                return Unauthorized();

            var user = await _dbContext.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
                return NotFound();

            return Ok(new
            {
                user.UserId,
                user.Username,
                user.Email,
                user.TenantId,
                Role = user.Role?.RoleName,
                user.CreatedAt
            });
        }

        [HttpGet("user-info")]
        public IActionResult GetUserInfo()
        {
            var identity = HttpContext.User.Identity as ClaimsIdentity;
            if (identity == null)
                return Unauthorized();

            var username = identity.FindFirst(ClaimTypes.Name)?.Value;
            var role = identity.FindFirst(ClaimTypes.Role)?.Value;
            var tenantId = identity.FindFirst("TenantId")?.Value;

            return Ok(new
            {
                username,
                role,
                tenantId
            });
        }
    }
}
