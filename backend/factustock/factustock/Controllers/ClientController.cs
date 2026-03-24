using factustock.DTOs;
using factustock.Services;
using factustock.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FactuStock.Controllers;

[ApiController]
[Route("api/clients")]
[Authorize]                        // all endpoints require a valid JWT
public class ClientController(IClientService clientService) : ControllerBase
{
    // ── POST /api/clients ────────────────────────────────────────────────────
    /// <summary>Create a new client.</summary>
    [HttpPost]
    public async Task<ActionResult<ClientDto>> CreateClient([FromBody] CreateClientRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var (data, error) = await clientService.CreateClientAsync(request, GetUserId());

        if (error is not null) return Conflict(new { message = error });

        return CreatedAtAction(nameof(GetClient), new { id = data!.Id }, data);
    }

    // ── PUT /api/clients/{id} ────────────────────────────────────────────────
    /// <summary>Update an existing client's information.</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ClientDto>> UpdateClient(
        int id, [FromBody] UpdateClientRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var (data, error) = await clientService.UpdateClientAsync(id, request, GetUserId());

        if (error is not null)
            return error.Contains("introuvable") ? NotFound(new { message = error })
                                                 : BadRequest(new { message = error });
        return Ok(data);
    }

    // ── GET /api/clients/{id} ────────────────────────────────────────────────
    /// <summary>Get full detail of a single client.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClientDto>> GetClient(int id)
    {
        var (data, error) = await clientService.GetClientAsync(id);

        if (error is not null) return NotFound(new { message = error });

        return Ok(data);
    }

    // ── GET /api/clients ─────────────────────────────────────────────────────
    /// <summary>
    /// Paginated, searchable, filterable client list.
    /// Query params: search, type, includeArchived, page, pageSize
    /// Examples:
    ///   GET /api/clients
    ///   GET /api/clients?search=benali
    ///   GET /api/clients?type=Company&page=2&pageSize=10
    ///   GET /api/clients?includeArchived=true
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ClientPagedResult>> GetAllClients(
        [FromQuery] string? search = null,
        [FromQuery] string? type = null,
        [FromQuery] bool includeArchived = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        // Parse optional type enum from query string
        factustock.Enums.ClientType? parsedType = null;
        if (!string.IsNullOrWhiteSpace(type) &&
            Enum.TryParse<factustock.Enums.ClientType>(type, ignoreCase: true, out var t))
            parsedType = t;

        // Clamp pageSize to prevent abuse
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = new ClientQueryRequest(search, parsedType, includeArchived, page, pageSize);
        var result = await clientService.GetAllClientsAsync(query);

        return Ok(result);
    }

    // ── GET /api/clients/{id}/stats ──────────────────────────────────────────
    /// <summary>
    /// Financial summary for one client:
    /// total invoiced, total paid, outstanding, invoice counts by status.
    /// </summary>
    [HttpGet("{id:int}/stats")]
    public async Task<ActionResult<ClientStatsDto>> GetClientStats(int id)
    {
        var (data, error) = await clientService.GetClientStatsAsync(id);

        if (error is not null) return NotFound(new { message = error });

        return Ok(data);
    }

    // ── GET /api/clients/{id}/invoices ───────────────────────────────────────
    /// <summary>Invoice history for one client, newest first.</summary>
    [HttpGet("{id:int}/invoices")]
    public async Task<ActionResult<List<ClientInvoiceRowDto>>> GetClientInvoices(int id)
    {
        var (data, error) = await clientService.GetClientInvoicesAsync(id);

        if (error is not null) return NotFound(new { message = error });

        return Ok(data);
    }

    // ── PATCH /api/clients/{id}/archive ─────────────────────────────────────
    /// <summary>
    /// Soft-delete a client. Preserves all invoice history.
    /// Admin only — employees should not archive clients.
    /// </summary>
    [HttpPatch("{id:int}/archive")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> ArchiveClient(int id)
    {
        var (success, error) = await clientService.ArchiveClientAsync(id, GetUserId());

        if (!success)
            return error!.Contains("introuvable") ? NotFound(new { message = error })
                                                   : BadRequest(new { message = error });
        return Ok(new { message = "Client archivé avec succès." });
    }

    // ── PATCH /api/clients/{id}/restore ─────────────────────────────────────
    /// <summary>Restore an archived client. Admin only.</summary>
    [HttpPatch("{id:int}/restore")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> RestoreClient(int id)
    {
        var (success, error) = await clientService.RestoreClientAsync(id, GetUserId());

        if (!success)
            return error!.Contains("introuvable") ? NotFound(new { message = error })
                                                   : BadRequest(new { message = error });
        return Ok(new { message = "Client restauré avec succès." });
    }

    // ── PRIVATE ───────────────────────────────────────────────────────────────
    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("UserId claim missing."));
}