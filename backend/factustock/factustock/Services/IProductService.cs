using factustock.DTOs;

namespace factustock.Services
{
    public interface IProductService
    {
        // CRUD
        Task<(ProductDetailDto? Data, string? Error)> CreateProductAsync(CreateProductRequest request, int userId);
        Task<(ProductDetailDto? Data, string? Error)> UpdateProductAsync(int productId, UpdateProductRequest request, int userId);
        Task<(ProductDetailDto? Data, string? Error)> GetProductAsync(int productId);
        Task<ProductPagedResult> GetAllProductsAsync(ProductQueryRequest query);

        // Soft delete
        Task<(bool Success, string? Error)> ArchiveProductAsync(int productId, int userId);
        Task<(bool Success, string? Error)> RestoreProductAsync(int productId, int userId);

        // Stock
        Task<(ProductDto? Data, string? Error)> AdjustStockAsync(int productId, AdjustStockRequest request, int userId);
        Task<(List<StockMovementDto>? Data, string? Error)> GetStockHistoryAsync(int productId);
        Task<List<ProductDto>> GetLowStockProductsAsync();

        // Catalogue helpers
        Task<List<string>> GetCategoriesAsync();
        Task<List<ProductPickerDto>> SearchProductsAsync(string term);
    }


}
