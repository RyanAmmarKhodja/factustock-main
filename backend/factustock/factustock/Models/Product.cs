namespace factustock.Models
{
    // ─────────────────────────────────────────────
    // PRODUIT
    // Products / services in the catalogue
    // ─────────────────────────────────────────────
    public class Product
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Category { get; set; }
        public decimal Price { get; set; }
        public string? Unit { get; set; }                          // "kg", "pcs", "L" etc.
        public decimal DefaultTaxRate { get; set; } = 19;          // TVA 19% standard in Algeria
        public decimal StockQuantity { get; set; } = 0;
        public decimal MinStockLevel { get; set; } = 0;
        public string? Barcode { get; set; }
        public bool Active { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Company Company { get; set; } = null!;
        public ICollection<InvoiceItem> InvoiceItems { get; set; } = [];
        public ICollection<StockMovement> StockMovements { get; set; } = [];
    }
}
