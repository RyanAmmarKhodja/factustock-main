using factustock.Enums;

namespace factustock.DTOs
{
    // ════════════════════════════════════════════
    // PAYMENT
    // ════════════════════════════════════════════
    public record CreatePaymentRequest(
        int InvoiceId,
        decimal Amount,
        DateTime PaymentDate,
        PaymentMethod Method,
        string? Reference,
        string? Notes
    );

    public record PaymentDto(
        int Id,
        decimal Amount,
        DateTime PaymentDate,
        PaymentMethod Method,
        string? Reference,
        string RecordedByUser,
        DateTime CreatedAt
    );

    // ════════════════════════════════════════════
    // AUDIT LOG
    // ════════════════════════════════════════════
    public record AuditLogDto(
        int Id,
        string UserFullName,
        string EntityType,
        int EntityId,
        string Action,
        string? OldValue,
        string? NewValue,
        string? Details,
        string? IpAddress,
        DateTime CreatedAt
    );

    public record AuditLogFilterRequest(
        string? EntityType,
        int? UserId,
        DateTime? From,
        DateTime? To,
        int Page = 1,
        int PageSize = 50
    );
}
