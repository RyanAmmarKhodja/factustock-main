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
        string? Details,
        DateTime CreatedAt
    );

    public record AuditLogPagedResult(
        List<AuditLogDto> Items,
        int TotalCount,
        int Page,
        int PageSize,
        int TotalPages
    );
}
