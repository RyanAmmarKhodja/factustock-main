namespace factustock.Models
{
    public class BonItem
    {
        public int Id { get; set; }
        public int BonId { get; set; }
        public int ProductId { get; set; }
        public string? Code { get; set; }
        public string Designation { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string? Unit { get; set; }
        public decimal PricePerUnit { get; set; }
        public decimal TVA { get; set; }
        public decimal PriceHorsTaxe { get; set; }
        public decimal PriceTTC { get; set; }

        // Navigation
        public Bon Bon { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}
