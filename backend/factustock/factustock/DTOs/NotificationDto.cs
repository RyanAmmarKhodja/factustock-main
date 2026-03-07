using factustock.Enums;

namespace factustock.DTOs
{
    // ════════════════════════════════════════════
    // NOTIFICATION
    // ════════════════════════════════════════════
    public record NotificationDto(
        int Id,
        NotificationType Type,
        string Message,
        bool IsRead,
        int? InvoiceId,
        DateTime CreatedAt
    );
}
