using factustock.Enums;

namespace factustock.DTOs
{
    // ════════════════════════════════════════════
    // INVOICE
    // ════════════════════════════════════════════
    public record CreateInvoiceRequest(
        int ClientId,
        DateTime InvoiceDate,
        DateTime DueDate,
        PaymentMethod? PaymentMethod,
        string? Notes,
        List<CreateInvoiceItemRequest> Items
    );

    public record CreateInvoiceItemRequest(
        int ProductId,
        decimal Quantity,
        decimal? PricePerUnitOverride,   // null = use product's current price
        decimal? TVAOverride             // null = use product's DefaultTaxRate
    );

    public record UpdateInvoiceStatusRequest(InvoiceStatus Status);

    public record InvoiceItemDto(
        int Id,
        int ProductId,
        string Reference,
        string Designation,
        decimal Quantity,
        string? Unit,
        decimal PricePerUnit,
        decimal TVA,
        decimal PriceHorsTaxe,
        decimal PriceTTC
    );

    public record InvoiceDto(
        int Id,
        string InvoiceNumber,
        DateTime InvoiceDate,
        DateTime DueDate,
        InvoiceStatus Status,
        string ClientName,
        int ClientId,
        string CreatedByUser,
        decimal TotalHorsTaxe,
        decimal TTC,
        PaymentMethod? PaymentMethod,
        string? Notes,
        DateTime CreatedAt,
        List<InvoiceItemDto> Items,
        List<PaymentDto> Payments
    );

    public record InvoiceSummaryDto(
        int Id,
        string InvoiceNumber,
        DateTime InvoiceDate,
        DateTime DueDate,
        InvoiceStatus Status,
        string ClientName,
        decimal TTC
    );
}
