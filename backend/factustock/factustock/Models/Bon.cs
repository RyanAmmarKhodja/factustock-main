using factustock.Enums;

namespace factustock.Models
{
    // ─────────────────────────────────────────────
    // BON (Livraison / Réception / Commande)
    // Document snapshot — same snapshot pattern as Invoice
    // ─────────────────────────────────────────────
    public class Bon
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public int CreatedByUserId { get; set; }
        public BonType Type { get; set; }
        public string BonNumber { get; set; } = string.Empty;   // e.g. BL-001/2026
        public DateTime BonDate { get; set; }
        public int? ClientId { get; set; }                       // null = one-time client

        // Client snapshot
        public string? ClientLegalName { get; set; }
        public string? ClientAddress { get; set; }
        public string? ClientTel { get; set; }
        public string? ClientNIF { get; set; }
        public string? ClientAI { get; set; }
        public string? ClientRC { get; set; }
        public string? ClientNIS { get; set; }

        // Financial totals
        public decimal TotalHorsTaxe { get; set; }
        public decimal TTC { get; set; }

        public string? Notes { get; set; }
        public string? GeneratedPdfPath { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Company Company { get; set; } = null!;
        public User CreatedByUser { get; set; } = null!;
        public Client? Client { get; set; }
        public ICollection<BonItem> Items { get; set; } = [];
    }
}
