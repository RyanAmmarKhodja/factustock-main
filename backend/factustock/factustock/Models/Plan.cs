namespace factustock.Models
{

    // ─────────────────────────────────────────────
    // PLAN
    // Describes a purchasable tier (Starter, Business, Pro)
    // ─────────────────────────────────────────────
    public class Plan
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;           // "Starter", "Business", "Pro"
        public int MaxAdminAccounts { get; set; }                  // how many admins allowed
        public int MaxUserAccounts { get; set; }                   // how many employees allowed
        public int MaxTotalAccounts { get; set; }                  // MaxAdmin + MaxUser (enforced in trigger)
        public decimal Price { get; set; }                         // monthly/yearly base price
        public decimal SetupFee { get; set; }                      // one-time installation fee
        public bool IsActive { get; set; } = true;

        // Navigation
        public ICollection<Subscription> Subscriptions { get; set; } = [];
    }
}
