using factustock.DTOs;

namespace factustock.Services
{
    public interface ISupplierService
    {
        Task<(SupplierDto? Data, string? Error)> CreateSupplierAsync(CreateSupplierRequest request, int userId);
        Task<(SupplierDto? Data, string? Error)> UpdateSupplierAsync(int supplierId, UpdateSupplierRequest request, int userId);
        Task<(bool Success, string? Error)> ArchiveSupplierAsync(int supplierId, int userId);
        Task<(bool Success, string? Error)> RestoreSupplierAsync(int supplierId, int userId);
        Task<(SupplierDto? Data, string? Error)> GetSupplierAsync(int supplierId);
        Task<SupplierPagedResult> GetAllSuppliersAsync(SupplierQueryRequest query);
        //Task<(SupplierStatsDto? Data, string? Error)> GetSupplierStatsAsync(int supplierId);
        //Task<(List<SupplierInvoiceRowDto>? Data, string? Error)> GetSupplierInvoicesAsync(int supplierId);
    }
}
