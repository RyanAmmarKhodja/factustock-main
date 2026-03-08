using factustock.Data;
using factustock.Models;
using factustock.Data;
using factustock.Models;
using Microsoft.EntityFrameworkCore;

namespace factustock.Services;

// ─────────────────────────────────────────────
// INTERFACE
// ─────────────────────────────────────────────
public interface IAuditService
{
    /// <summary>
    /// Log any action taken by a user on any entity.
    /// Call this from every service that mutates data.
    /// </summary>
    Task LogAsync(
        int userId,
        string entityType,
        int entityId,
        string action,
        string? oldValue = null,
        string? newValue = null,
        string? details = null,
        string? ipAddress = null
    );
}

// ─────────────────────────────────────────────
// IMPLEMENTATION
// ─────────────────────────────────────────────
public class AuditService(AppDbContext db) : IAuditService
{
    public async Task LogAsync(
        int userId,
        string entityType,
        int entityId,
        string action,
        string? oldValue = null,
        string? newValue = null,
        string? details = null,
        string? ipAddress = null)
    {
        var log = new AuditLog
        {
            UserId = userId,
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            OldValue = oldValue,
            NewValue = newValue,
            Details = details,
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow
        };

        db.AuditLogs.Add(log);
        await db.SaveChangesAsync();
    }
}