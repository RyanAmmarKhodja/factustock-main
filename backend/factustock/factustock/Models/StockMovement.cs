using factustock.Enums;
namespace factustock.Models
{
    // ─────────────────────────────────────────────
    // STOCK MOVEMENT
    // Every stock change is recorded — never just update StockQuantity silently
    // ─────────────────────────────────────────────
    public class StockMovement
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int UserId { get; set; }
        public int? InvoiceId { get; set; }                        // nullable — not all movements come from invoices
        public StockMovementType Type { get; set; }
        public decimal Quantity { get; set; }
        public decimal QuantityBefore { get; set; }
        public decimal QuantityAfter { get; set; }
        public string? Reason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Product Product { get; set; } = null!;
        public User User { get; set; } = null!;
        public Invoice? Invoice { get; set; }
    }
}
