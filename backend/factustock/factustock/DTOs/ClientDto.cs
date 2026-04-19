using factustock.Enums;
using System.ComponentModel.DataAnnotations;
namespace factustock.DTOs
{
    // ════════════════════════════════════════════
    // REQUEST DTOs
    // ════════════════════════════════════════════

    public record CreateClientRequest(
        [Required] ClientType Type,
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

    public record UpdateClientRequest(
        [Required] ClientType Type,
        [Required][MaxLength(200)] string LegalName,
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
   
    public record ClientQueryRequest(
        string? Search = null,   // searches LegalName, FirstName, LastName, NIF, Tel
        ClientType? Type = null,
        bool IncludeArchived = false,
        int Page = 1,
        int PageSize = 20
    );

    // ════════════════════════════════════════════
    // RESPONSE DTOs
    // ════════════════════════════════════════════

    /// Full client detail — used on the client detail/edit page.
 
    public record ClientDto(
        int Id,
        ClientType Type,
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

    /// Lightweight row — used in the clients table list.
    /// Does not carry all legal fields to keep payload small.
    public record ClientSummaryDto(
        int Id,
        ClientType Type,
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

    /// Financial stats shown on the client detail card.
    /// All amounts are in DZD.
    public record ClientStatsDto(
        int ClientId,
        string ClientName,
        int TotalInvoices,
        int PaidInvoices,
        int PendingInvoices,
        int OverdueInvoices,
        decimal TotalInvoicedTTC,     // sum of all invoice TTC
        decimal TotalPaid,            // sum of all payments received
        decimal TotalOutstanding      // TotalInvoicedTTC - TotalPaid
    );


    /// Invoice row shown inside the client's invoice history tab.
    /// Kept minimal — full detail is in the invoice module.
    public record ClientInvoiceRowDto(
        int Id,
        string InvoiceNumber,
        DateTime InvoiceDate,
        DateTime DueDate,
        InvoiceStatus Status,
        decimal TTC,
        decimal AmountPaid,
        decimal AmountOutstanding
    );


    /// Paginated wrapper used for GetAllClients response.
    public record ClientPagedResult(
        List<ClientSummaryDto> Items,
        int TotalCount,
        int Page,
        int PageSize,
        int TotalPages
    );

}
