using factustock.Enums;

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

    public record StockMovementDto(
        int Id,
        string ProductName,
        string ProductCode,
        StockMovementType Type,
        decimal Quantity,
        decimal QuantityBefore,
        decimal QuantityAfter,
        string? Reason,
        string CreatedByUser,
        DateTime CreatedAt
    );
}
