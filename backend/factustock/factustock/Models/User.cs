namespace factustock.Models
{
    // ─────────────────────────────────────────────
    // USER
    // ─────────────────────────────────────────────
    public class User
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public int RoleId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public bool Active { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }

        // Navigation
        public Company Company { get; set; } = null!;
        public Role Role { get; set; } = null!;
        public ICollection<AuditLog> AuditLogs { get; set; } = [];
        public ICollection<StockMovement> StockMovements { get; set; } = [];
        public ICollection<Notification> Notifications { get; set; } = [];
    }
}
