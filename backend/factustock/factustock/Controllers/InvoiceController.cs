namespace factustock.Controllers
{
    using factustock.Data;
    using factustock.DTOs;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;

    [ApiController]
    [Route("api/invoices")]
    [Authorize]
    public class InvoiceController(AppDbContext context) : ControllerBase
    {
        private const int CompanyId = 1;

        // ── GET /api/invoices ─────────────────────────────────────────────────
        [HttpGet]
        public async Task<ActionResult<InvoicePagedResult>> GetInvoices(
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = context.Invoices
                .Where(i => i.CompanyId == CompanyId)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(i =>
                    i.InvoiceNumber.Contains(search) ||
                    (i.ClientLegalName != null && i.ClientLegalName.Contains(search)));

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var items = await query
                .OrderByDescending(i => i.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(i => new InvoiceListItem(
                    i.Id,
                    i.InvoiceNumber,
                    i.InvoiceDate,
                    i.DueDate,
                    i.ClientId,
                    i.ClientLegalName,
                    i.Status.ToString(),
                    i.TotalHorsTaxe,
                    i.TTC,
                    i.PaymentMethod != null ? i.PaymentMethod.ToString() : null,
                    i.CreatedAt
                ))
                .ToListAsync();

            return Ok(new InvoicePagedResult(items, totalCount, page, pageSize, totalPages));
        }

        // ── GET /api/invoices/{id} ────────────────────────────────────────────
        [HttpGet("{id:int}")]
        public async Task<ActionResult<InvoiceDetailDto>> GetInvoice(int id)
        {
            var invoice = await context.Invoices
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == id && i.CompanyId == CompanyId);

            if (invoice is null)
                return NotFound(new { message = "Facture introuvable." });

            var dto = new InvoiceDetailDto(
                invoice.Id,
                invoice.InvoiceNumber,
                invoice.InvoiceDate,
                invoice.DueDate,
                invoice.ClientId,
                invoice.ClientLegalName,
                invoice.ClientAddress,
                invoice.ClientTel,
                invoice.ClientEmail,
                invoice.ClientRC,
                invoice.ClientNIF,
                invoice.ClientNIS,
                invoice.ClientAI,
                invoice.Status.ToString(),
                invoice.PaymentMethod?.ToString(),
                invoice.TotalHorsTaxe,
                invoice.TTC,
                invoice.Notes,
                invoice.GeneratedPdfPath != null ? $"/api/documents/invoice/{invoice.Id}/pdf" : null,
                invoice.CreatedAt,
                invoice.Items.Select(item => new InvoiceItemDto(
                    item.Id,
                    item.ProductId,
                    item.Code,
                    item.Designation,
                    item.Quantity,
                    item.Unit,
                    item.PricePerUnit,
                    item.TVA,
                    item.PriceHorsTaxe,
                    item.PriceTTC
                )).ToList()
            );

            return Ok(dto);
        }
    }
}
