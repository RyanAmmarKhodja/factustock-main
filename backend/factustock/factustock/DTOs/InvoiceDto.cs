using factustock.Enums;

namespace factustock.DTOs
{
    // ════════════════════════════════════════════
    // INVOICE — LIST / DETAIL DTOs
    // ════════════════════════════════════════════

    public record InvoiceListItem(
        int Id,
        string InvoiceNumber,
        DateTime InvoiceDate,
        DateTime? DueDate,
        int? ClientId,
        string? ClientLegalName,
        string Status,
        decimal TotalHorsTaxe,
        decimal TTC,
        string? PaymentMethod,
        DateTime CreatedAt
    );

    public record InvoicePagedResult(
        List<InvoiceListItem> Items,
        int TotalCount,
        int Page,
        int PageSize,
        int TotalPages
    );

    public record InvoiceDetailDto(
        int Id,
        string InvoiceNumber,
        DateTime InvoiceDate,
        DateTime? DueDate,
        int? ClientId,
        string? ClientLegalName,
        string? ClientAddress,
        string? ClientTel,
        string? ClientEmail,
        string? ClientRC,
        string? ClientNIF,
        string? ClientNIS,
        string? ClientAI,
        string Status,
        string? PaymentMethod,
        decimal TotalHorsTaxe,
        decimal TTC,
        string? Notes,
        string? PdfDownloadUrl,
        DateTime CreatedAt,
        List<InvoiceItemDto> Items
    );

    public record InvoiceItemDto(
        int Id,
        int ProductId,
        string? Code,
        string Designation,
        decimal Quantity,
        string? Unit,
        decimal PricePerUnit,
        decimal TVA,
        decimal PriceHorsTaxe,
        decimal PriceTTC
    );

    public record InvoiceSummaryDto(
        int Id,
        string InvoiceNumber,
        DateTime InvoiceDate,
        DateTime? DueDate,
        string Status,
        string? ClientLegalName,
        decimal TTC
    );
}
