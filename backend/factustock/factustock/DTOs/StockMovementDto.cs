using factustock.Enums;
using System.ComponentModel.DataAnnotations;

namespace factustock.DTOs
{
    // ════════════════════════════════════════════
    // STOCK MOVEMENT
    // ════════════════════════════════════════════
    public record CreateStockMovementRequest(
        int ProductId,
        StockMovementType Type,
        decimal Quantity,
        string? Reason
    );

    /// Manual stock adjustment request.
    /// NewQuantity is the REAL physical count — the service
    /// computes the delta and writes a StockMovement automatically.
    public record AdjustStockRequest(
        [Required][Range(0, double.MaxValue)] decimal NewQuantity,
        [Required][MaxLength(300)] string Reason
    );

    //public record StockMovementDto(
    //    int Id,
    //    string ProductName,
    //    string ProductCode,
    //    StockMovementType Type,
    //    decimal Quantity,
    //    decimal QuantityBefore,
    //    decimal QuantityAfter,
    //    string? Reason,
    //    string? PerformedBy,    // user full name
    //    string? InvoiceNumber,  // populated if movement came from an invoice
    //    string CreatedByUser,
    //    DateTime CreatedAt
    //);

    public record StockMovementDto(
    int Id,
    StockMovementType Type,
    decimal Quantity,
    decimal QuantityBefore,
    decimal QuantityAfter,
    string? Reason,
    string PerformedBy,    // user full name
    string? InvoiceNumber,  // populated if movement came from an invoice
    DateTime CreatedAt
);
}
