using factustock.Enums;
namespace factustock.Models
{
    // ─────────────────────────────────────────────
    // NOTIFICATION
    // In-app alerts for due invoices, low stock etc.
    // ─────────────────────────────────────────────
    public class Notification
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int? InvoiceId { get; set; }                        // nullable — not all notifications relate to invoices
        public NotificationType Type { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User User { get; set; } = null!;
        public Invoice? Invoice { get; set; }
    }
}
