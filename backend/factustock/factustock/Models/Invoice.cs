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
        public int ClientId { get; set; }
        public int CompanyId { get; set; }
        public int CreatedByUserId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public DateTime DueDate { get; set; }                      // needed for overdue notifications
        public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
        public PaymentMethod? PaymentMethod { get; set; }

        // Legal snapshots — computed at creation, stored forever
        // Do NOT recompute from InvoiceItems after invoice is issued
        public decimal TotalHorsTaxe { get; set; }
        public decimal TTC { get; set; }

        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Client Client { get; set; } = null!;
        public Company Company { get; set; } = null!;
        public User CreatedByUser { get; set; } = null!;
        public ICollection<InvoiceItem> Items { get; set; } = [];
        public ICollection<Payment> Payments { get; set; } = [];
        public ICollection<Notification> Notifications { get; set; } = [];
        public ICollection<StockMovement> StockMovements { get; set; } = [];
    }
}
