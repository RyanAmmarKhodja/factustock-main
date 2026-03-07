namespace factustock.Models
{
    // ─────────────────────────────────────────────
    // AUDIT LOG
    // Immutable record of every action by every user
    // ─────────────────────────────────────────────
    public class AuditLog
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string EntityType { get; set; } = string.Empty;     // "Invoice", "Client", "User" etc.
        public int EntityId { get; set; }
        public string Action { get; set; } = string.Empty;         // "Create", "Update", "Delete"
        public string? OldValue { get; set; }                      // JSON snapshot before
        public string? NewValue { get; set; }                      // JSON snapshot after
        public string? Details { get; set; }
        public string? IpAddress { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User User { get; set; } = null!;
    }
}
