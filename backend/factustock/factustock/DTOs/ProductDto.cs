namespace factustock.DTOs
{
    // ════════════════════════════════════════════
    // PRODUIT
    // ════════════════════════════════════════════
    public record CreateProduitRequest(
        string Code,
        string Name,
        string? Description,
        string? Category,
        decimal Price,
        string? Unit,
        decimal DefaultTaxRate,
        decimal StockQuantity,
        decimal MinStockLevel,
        string? Barcode
    );

    public record UpdateProduitRequest(
        string Name,
        string? Description,
        string? Category,
        decimal Price,
        string? Unit,
        decimal DefaultTaxRate,
        decimal MinStockLevel,
        string? Barcode,
        bool Active
    );

    public record ProduitDto(
        int Id,
        string Code,
        string Name,
        string? Category,
        decimal Price,
        string? Unit,
        decimal DefaultTaxRate,
        decimal StockQuantity,
        decimal MinStockLevel,
        bool Active,
        bool LowStock      // StockQuantity <= MinStockLevel
    );
}
