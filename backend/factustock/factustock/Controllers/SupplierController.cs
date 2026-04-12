using factustock.DTOs;
using factustock.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


namespace factustock.Controllers
{
    [ApiController]
    [Route("api/suppliers")]
    [Authorize]
    public class SupplierController : ControllerBase
    {
        private readonly ISupplierService supplierService;
        public SupplierController(ISupplierService supplierService)
        {
            this.supplierService = supplierService;
        }
        // ── POST /api/suppliers ────────────────────────────────────────────────────
        /// <summary>Create a new supplier.</summary>
        [HttpPost]
        public async Task<ActionResult<SupplierDto>> CreateSupplier([FromBody] CreateSupplierRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (data, error) = await supplierService.CreateSupplierAsync(request, GetUserId());
            if (error is not null) return Conflict(new { message = error });

            return CreatedAtAction(nameof(GetSupplier), new { id = data!.Id }, data);
        }

        // ── PUT /api/suppliers/{id} ────────────────────────────────────────────────
        /// <summary>Update an existing supplier's information.</summary>
        [HttpPut("{id:int}")]
        public async Task<ActionResult<SupplierDto>> UpdateSupplier(
            int id, [FromBody] UpdateSupplierRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (data, error) = await supplierService.UpdateSupplierAsync(id, request, GetUserId());
            if (error is not null)
                return error.Contains("introuvable") ? NotFound(new { message = error })
                                                     : BadRequest(new { message = error });
            return Ok(data);
        }

        // ── GET /api/suppliers/{id} ────────────────────────────────────────────────
        /// <summary>Get full detail of a single supplier.</summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<SupplierDto>> GetSupplier(int id)
        {
            var (data, error) = await supplierService.GetSupplierAsync(id);

            if (error is not null) return NotFound(new { message = error });

            return Ok(data);
        }

        // ── GET /api/suppliers ─────────────────────────────────────────────────────
        /// <summary>
        /// Paginated, searchable, filterable supplier list.
        /// Query params: search, type, includeArchived, page, pageSize
        /// Examples:
        ///   GET /api/suppliers
        ///   GET /api/suppliers?search=benali
        ///   GET /api/suppliers?type=Company&page=2&pageSize=10
        ///   GET /api/suppliers?includeArchived=true
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<SupplierPagedResult>> GetAllSuppliers(
            [FromQuery] string? search = null,
            [FromQuery] string? type = null,
            [FromQuery] bool includeArchived = false,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {

            // Clamp pageSize to prevent abuse
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = new SupplierQueryRequest(search, includeArchived, page, pageSize);
            var result = await supplierService.GetAllSuppliersAsync(query);

            return Ok(result);
        }

        // ── GET /api/suppliers/{id}/stats ──────────────────────────────────────────
        /// <summary>
        /// Financial summary for one supplier:
        /// total invoiced, total paid, outstanding, invoice counts by status.
        /// </summary>
        //[HttpGet("{id:int}/stats")]
        //public async Task<ActionResult<SupplierStatsDto>> GetSupplierStats(int id)
        //{
        //    var (data, error) = await supplierService.GetSupplierStatsAsync(id);

        //    if (error is not null) return NotFound(new { message = error });

        //    return Ok(data);
        //}

        // ── GET /api/clients/{id}/invoices ───────────────────────────────────────
        /// <summary>Invoice history for one supplier, newest first.</summary>
        //[HttpGet("{id:int}/invoices")]
        //public async Task<ActionResult<List<SupplierInvoiceRowDto>>> GetSupplierInvoices(int id)
        //{
        //    var (data, error) = await supplierService.GetSupplierInvoicesAsync(id);

        //    if (error is not null) return NotFound(new { message = error });

        //    return Ok(data);
        //}

        // ── PATCH /api/clients/{id}/archive ─────────────────────────────────────
        /// <summary>
        /// Soft-delete a client. Preserves all invoice history.
        /// Admin only — employees should not archive clients.
        /// </summary>
        [HttpPatch("{id:int}/archive")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> ArchiveSupplier(int id)
        {
            var (success, error) = await supplierService.ArchiveSupplierAsync(id, GetUserId());

            if (!success)
                return error!.Contains("introuvable") ? NotFound(new { message = error })
                                                       : BadRequest(new { message = error });
            return Ok(new { message = "Fournisseur archivé avec succès." });
        }

        // ── PATCH /api/suppliers/{id}/restore ─────────────────────────────────────
        /// <summary>Restore an archived supplier. Admin only.</summary>
        [HttpPatch("{id:int}/restore")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> RestoreSupplier(int id)
        {
            var (success, error) = await supplierService.RestoreSupplierAsync(id, GetUserId());

            if (!success)
                return error!.Contains("introuvable") ? NotFound(new { message = error })
                                                       : BadRequest(new { message = error });
            return Ok(new { message = "Fournisseur restauré avec succès." });
        }

        // ── PRIVATE ───────────────────────────────────────────────────────────────
        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new InvalidOperationException("UserId claim missing."));
    }
}
