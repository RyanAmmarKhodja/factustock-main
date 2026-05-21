using factustock.DTOs;

namespace factustock.Services
{
    public interface IDocumentService
    {
        Task<(GenerateInvoiceResponse? Data, string? Error)> GenerateInvoiceAsync(
            GenerateInvoiceRequest request, int userId);

        /// <summary>
        /// Re-download a previously generated invoice PDF from disk.
        /// Does not regenerate — serves the stored file.
        /// </summary>
        Task<(byte[]? Pdf, string? FileName, string? Error)> DownloadInvoiceAsync(int invoiceId);
    }
}
