using Microsoft.AspNetCore.Http;
using System.Linq;
using System.Threading.Tasks;

namespace MultiTenantTaskManagementSystem.Middleware
{
    public class TenantResolutionMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantResolutionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var tenantClaim = context.User.Claims.FirstOrDefault(c => c.Type == "TenantId");
                if (tenantClaim != null)
                {
                    context.Items["TenantId"] = tenantClaim.Value;
                }
            }

            await _next(context);
        }
    }
}
