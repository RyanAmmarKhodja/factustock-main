namespace factustock.Controllers
{
    using factustock.Data;
    using factustock.DTOs;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;

    [ApiController]
    [Route("api/logs")]
    [Authorize]
    public class AuditLogController(AppDbContext context) : ControllerBase
    {
        // ── GET /api/logs ─────────────────────────────────────────────────────
        [HttpGet]
        public async Task<ActionResult<AuditLogPagedResult>> GetLogs(
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = context.AuditLogs
                .Include(a => a.User)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(a =>
                    a.EntityType.Contains(search) ||
                    a.Action.Contains(search) ||
                    (a.Details != null && a.Details.Contains(search)));

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var items = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AuditLogDto(
                    a.Id,
                    a.User.FirstName + " " + a.User.LastName,
                    a.EntityType,
                    a.EntityId,
                    a.Action,
                    a.Details,
                    a.CreatedAt
                ))
                .ToListAsync();

            return Ok(new AuditLogPagedResult(items, totalCount, page, pageSize, totalPages));
        }
    }
}
