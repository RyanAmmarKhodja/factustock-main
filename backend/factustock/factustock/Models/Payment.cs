using factustock.Enums;
namespace factustock.Models
{
    // ─────────────────────────────────────────────
// PAYMENT
// Records payments against an invoice (partial or full)
// ─────────────────────────────────────────────
public class Payment
    {
        public int Id { get; set; }
        public int InvoiceId { get; set; }
        public int RecordedByUserId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public PaymentMethod Method { get; set; }
        public string? Reference { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Invoice Invoice { get; set; } = null!;
        public User RecordedByUser { get; set; } = null!;
    }
}
