
namespace factustock.Models
{
    // ─────────────────────────────────────────────
    // COMPANY
    // The tenant — one per installation
    // ─────────────────────────────────────────────
    public class Company
    {
        public int Id { get; set; }
        public int? SubscriptionId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? LegalName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Tel { get; set; }
        public string? Adresse { get; set; }

        // Algerian legal identifiers
        public string? RC { get; set; }                            // Registre de Commerce
        public string? AI { get; set; }                            // Article d'Imposition
        public string? NIF { get; set; }                           // Numéro d'Identification Fiscale
        public string? NIS { get; set; }                           // Numéro d'Identification Statistique
        public string? N_BL { get; set; }
        public string? N_BP { get; set; }
        public string? N_Facture { get; set; }
        public string? LogoUrl { get; set; }
        public string? Website { get; set; }

        // Navigation
        public Subscription? Subscription { get; set; }
        public ICollection<User> Users { get; set; } = [];
        public ICollection<Client> Clients { get; set; } = [];
        public ICollection<Product> Products { get; set; } = [];
        public ICollection<Invoice> Invoices { get; set; } = [];
    }
}
