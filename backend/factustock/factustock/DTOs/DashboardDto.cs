namespace factustock.DTOs
{
    // ════════════════════════════════════════════
    // DASHBOARD
    // ════════════════════════════════════════════
    public record DashboardDto(
        int TotalInvoices,
        int DraftInvoices,
        int OverdueInvoices,
        decimal TotalRevenueTTC,
        decimal UnpaidTTC,
        int LowStockProducts,
        int TotalClients,
        List<InvoiceSummaryDto> RecentInvoices,
        List<NotificationDto> UnreadNotifications
    );
}
