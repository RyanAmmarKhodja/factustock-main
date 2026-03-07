namespace factustock.Models
{
    // ─────────────────────────────────────────────
    // INVOICE ITEM
    // Line items — price fields are snapshots at sale time
    // ─────────────────────────────────────────────
    public class InvoiceItem
    {
        public int Id { get; set; }
        public int InvoiceId { get; set; }
        public int ProductId { get; set; }
        public string Reference { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string? Unit { get; set; }

        // Price snapshot — captured at invoice creation, never updated
        public decimal PricePerUnit { get; set; }
        public decimal TVA { get; set; }                           // tax rate snapshot e.g. 19.00

        // Computed but stored for rendering performance
        public decimal PriceHorsTaxe { get; set; }                 // Quantity * PricePerUnit
        public decimal PriceTTC { get; set; }                      // PriceHorsTaxe * (1 + TVA/100)

        // Navigation
        public Invoice Invoice { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}
