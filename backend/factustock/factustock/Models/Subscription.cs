using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using factustock.Enums;

namespace factustock.Models
{
    // ─────────────────────────────────────────────
    // SUBSCRIPTION
    // One per Company — which plan they bought and when
    // ─────────────────────────────────────────────
    public class Subscription
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public int PlanId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime RenewalDate { get; set; }
        public DateTime PaidUntil { get; set; }
        public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;
        public BillingCycle BillingCycle { get; set; } = BillingCycle.Monthly;

        // Seat tracking — updated when users are created / deactivated
        public int ActiveUsers { get; set; } = 0;
        public int ActiveAdmins { get; set; } = 1;

        // Navigation
        public Company Company { get; set; } = null!;
        public Plan Plan { get; set; } = null!;
    }
}
