namespace factustock.Controllers
{
    using factustock.DTOs;
    using factustock.Services;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    [ApiController]
    [Route("api/documents")]
    [Authorize]
    public class DocumentController(IDocumentService documentService) : ControllerBase
    {
        // ── POST /api/documents/invoice ──────────────────────────────────────────
        /// <summary>
        /// Generate a new invoice:
        ///   1. Saves Invoice + InvoiceItems to DB
        ///   2. Decrements stock
        ///   3. Generates PDF with QuestPDF
        ///   4. Saves PDF to disk
        ///   5. Returns metadata + download URL
        ///
        /// The PDF is NOT streamed back here — client receives metadata first,
        /// then fetches the PDF separately via the download endpoint.
        /// This avoids timeout issues on slow machines.
        /// </summary>
        [HttpPost("invoice")]
        public async Task<ActionResult<GenerateInvoiceResponse>> GenerateInvoice(
            [FromBody] GenerateInvoiceRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Basic date sanity check
            if (request.DueDate < request.InvoiceDate)
                return BadRequest(new { message = "La date d'échéance ne peut pas être antérieure à la date de facture." });

            var (data, error) = await documentService.GenerateInvoiceAsync(request, GetUserId());

            if (error is not null)
                return error.Contains("introuvable") ? NotFound(new { message = error })
                                                     : BadRequest(new { message = error });
            return Ok(data);
        }

        // ── GET /api/documents/invoice/{id}/pdf ──────────────────────────────────
        /// <summary>
        /// Download the PDF of an existing invoice.
        /// Serves the stored file — does NOT regenerate.
        /// React calls this after GenerateInvoice returns the download URL.
        /// Can also be used to re-download at any time.
        /// </summary>
        [HttpGet("invoice/{id:int}/pdf")]
        public async Task<IActionResult> DownloadInvoice(int id)
        {
            var (pdfBytes, fileName, error) = await documentService.DownloadInvoiceAsync(id);

            if (error is not null)
                return error.Contains("introuvable") ? NotFound(new { message = error })
                                                     : BadRequest(new { message = error });

            // Return as inline PDF — browser will open it directly.
            // Change "inline" to "attachment" if you prefer a forced download.
            return File(pdfBytes!, "application/pdf", fileName,
                enableRangeProcessing: true);
        }

        // ── PRIVATE ───────────────────────────────────────────────────────────────
        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new InvalidOperationException("UserId claim missing."));
    }
}
