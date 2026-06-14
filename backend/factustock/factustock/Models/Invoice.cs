using factustock.Enums;
namespace factustock.Models
{
    // ─────────────────────────────────────────────
    // INVOICE
    // Legal document — totals are stored snapshots, not computed
    // ─────────────────────────────────────────────
    public class Invoice
    {
        public int Id { get; set; }
        public int? ClientId { get; set; }          // null = one-time client (not in DB)
        public int CompanyId { get; set; }
        public int CreatedByUserId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public DateTime? DueDate { get; set; }      // optional
        public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
        public PaymentMethod? PaymentMethod { get; set; }

        // Client snapshot — copied at creation time, never changes even if client is edited
        public string? ClientLegalName { get; set; }
        public string? ClientAddress { get; set; }
        public string? ClientTel { get; set; }
        public string? ClientEmail { get; set; }
        public string? ClientRC { get; set; }
        public string? ClientNIF { get; set; }
        public string? ClientNIS { get; set; }
        public string? ClientAI { get; set; }

        // Financial snapshots — computed at creation, stored forever
        public decimal TotalHorsTaxe { get; set; }
        public decimal TTC { get; set; }

        public string? Notes { get; set; }
        public string? GeneratedPdfPath { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Client? Client { get; set; }         // nullable since ClientId is nullable
        public Company Company { get; set; } = null!;
        public User CreatedByUser { get; set; } = null!;
        public ICollection<InvoiceItem> Items { get; set; } = [];
        public ICollection<Payment> Payments { get; set; } = [];
        public ICollection<Notification> Notifications { get; set; } = [];
        public ICollection<StockMovement> StockMovements { get; set; } = [];
    }
}
