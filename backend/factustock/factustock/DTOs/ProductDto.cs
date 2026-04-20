using System.ComponentModel.DataAnnotations;

namespace factustock.DTOs
{
    // ════════════════════════════════════════════
    // PRODUCT
    // ════════════════════════════════════════════
    public record CreateProductRequest(
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

    public record UpdateProductRequest(
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

    public record ProductDto(
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

    
    /// Full product detail including description and barcode.
    /// Used on the product detail / edit page.
    public record ProductDetailDto(
        int Id,
        string Code,
        string Name,
        string? Description,
        string? Category,
        decimal Price,
        string? Unit,
        decimal DefaultTaxRate,
        decimal StockQuantity,
        decimal MinStockLevel,
        string? Barcode,
        bool Active,
        bool LowStock,
        DateTime CreatedAt
    );


    /// Query params for GetAllProducts.
    /// All optional — omit to get unfiltered paginated list.
    public record ProductQueryRequest(
        string? Search = null,    // name, code, barcode
        string? Category = null,
        bool? Active = true,    // default: only active products
        bool LowStockOnly = false,
        int Page = 1,
        int PageSize = 20
    );


    /// Paginated product list response.
    public record ProductPagedResult(
        List<ProductDto> Items,
        int TotalCount,
        int Page,
        int PageSize,
        int TotalPages,
        int LowStockCount    // always returned so dashboard can show badge
    );

    
    /// Lightweight item used in invoice line-item picker.
    /// Only what the invoice form needs — no stock levels, no audit fields.
    public record ProductPickerDto(
        int Id,
        string Code,
        string Name,
        string? Unit,
        decimal Price,
        decimal DefaultTaxRate,
        decimal StockQuantity,
        bool LowStock
    );
}
