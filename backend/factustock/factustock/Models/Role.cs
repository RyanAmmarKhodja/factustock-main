namespace factustock.Models
{
    // ─────────────────────────────────────────────
    // ROLE
    // Flexible permissions — no redeploy needed to change access
    // ─────────────────────────────────────────────
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;           // "superadmin", "admin", "employee"
        public string? Description { get; set; }
        public string? Permissions { get; set; }                   // stored as JSON string

        // Navigation
        public ICollection<User> Users { get; set; } = [];
    }
}
