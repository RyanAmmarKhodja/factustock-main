using System.ComponentModel.DataAnnotations;
using factustock.Enums;

namespace factustock.DTOs
{

    // ════════════════════════════════════════════
    // REQUEST DTOs
    // ════════════════════════════════════════════

    public record CreateSupplierRequest(
        [MaxLength(200)] string LegalName,
        [MaxLength(100)] string? LastName,
        [MaxLength(100)] string? FirstName,
        [EmailAddress][MaxLength(200)] string? Email,
        [MaxLength(20)] string? Tel,
        [MaxLength(300)] string? Adresse,
        [MaxLength(50)] string? RC,
        [MaxLength(50)] string? AI,
        [MaxLength(20)] string? NIF,
        [MaxLength(20)] string? NIS,
        [MaxLength(50)] string? N_BL,
        [MaxLength(50)] string? N_BP
    );

    public record UpdateSupplierRequest(
        [MaxLength(200)] string LegalName,
        [MaxLength(100)] string? LastName,
        [MaxLength(100)] string? FirstName,
        [EmailAddress][MaxLength(200)] string? Email,
        [MaxLength(20)] string? Tel,
        [MaxLength(300)] string? Adresse,
        [MaxLength(50)] string? RC,
        [MaxLength(50)] string? AI,
        [MaxLength(20)] string? NIF,
        [MaxLength(20)] string? NIS,
        [MaxLength(50)] string? N_BL,
        [MaxLength(50)] string? N_BP
    );


    /// Query parameters for GetAllClients / SearchAndFilter.
    /// All fields are optional — omitting them means "no filter on this field".

    public record SupplierQueryRequest(
        string? Search = null,   // searches LegalName, FirstName, LastName, NIF, Tel
        bool IncludeArchived = false,
        int Page = 1,
        int PageSize = 20
    );

    // ════════════════════════════════════════════
    // RESPONSE DTOs
    // ════════════════════════════════════════════

    /// Full supplier detail — used on the supplier detail/edit page.

    public record SupplierDto(
        int Id,
        string LegalName,
        string? LastName,
        string? FirstName,
        string? Email,
        string? Tel,
        string? Adresse,
        string? RC,
        string? AI,
        string? NIF,
        string? NIS,
        string? N_BL,
        string? N_BP,
        bool IsArchived,
        DateTime? ArchivedAt,
        DateTime CreatedAt
    );

    /// Lightweight row — used in the suppliers table list.
    /// Does not carry all legal fields to keep payload small.
    public record SupplierSummaryDto(
        int Id,
        string LegalName,
        string? FirstName,
        string? LastName,
        string? Tel,
        string? Email,
        string? NIF,
        bool IsArchived,
        int TotalInvoices,
        DateTime CreatedAt
    );

    /// Financial stats shown on the supplier detail card.
    /// All amounts are in DZD.
    public record SupplierStatsDto(
        int SupplierId,
        string SupplierName,
        int TotalInvoices,
        int PaidInvoices,
        int PendingInvoices,
        int OverdueInvoices,
        decimal TotalInvoicedTTC,     // sum of all invoice TTC
        decimal TotalPaid,            // sum of all payments received
        decimal TotalOutstanding      // TotalInvoicedTTC - TotalPaid
    );


    /// Invoice row shown inside the supplier's invoice history tab.
    /// Kept minimal — full detail is in the invoice module.
    public record SupplierInvoiceRowDto(
        int Id,
        string InvoiceNumber,
        DateTime InvoiceDate,
        DateTime DueDate,
        InvoiceStatus Status,
        decimal TTC,
        decimal AmountPaid,
        decimal AmountOutstanding
    );


    /// Paginated wrapper used for GetAllSuppliers response.
    public record SupplierPagedResult(
        List<SupplierSummaryDto> Items,
        int TotalCount,
        int Page,
        int PageSize,
        int TotalPages
    );
}
