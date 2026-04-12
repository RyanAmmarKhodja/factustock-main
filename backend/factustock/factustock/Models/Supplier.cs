using factustock.Enums;

namespace factustock.Models
{
    public class Supplier
    {
        public int Id { get; set; }
        public int CompanyId { get; set; } = 1;
        public string LegalName { get; set; } = string.Empty;
        public string? LastName { get; set; }
        public string? FirstName { get; set; }
        public string? Email { get; set; }
        public string? Tel { get; set; }
        public string? Adresse { get; set; }

        // Algerian legal identifiers
        public string? RC { get; set; }
        public string? AI { get; set; }
        public string? NIF { get; set; }
        public string? NIS { get; set; }
        public string? N_BL { get; set; }
        public string? N_BP { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsArchived { get; set; } = false;
        public DateTime? ArchivedAt { get; set; }

        // Navigation
        public Company Company { get; set; } = null!;
        public ICollection<Invoice> Invoices { get; set; } = [];
    }
}
