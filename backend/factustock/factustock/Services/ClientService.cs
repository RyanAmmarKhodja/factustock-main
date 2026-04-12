
using factustock.Data;
using factustock.DTOs;
using factustock.Enums;
using factustock.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace factustock.Services
{
    public class ClientService : IClientService
    {
        private readonly AppDbContext _context;
        private readonly IAuditService _audit;
        public ClientService(AppDbContext context, IAuditService audit)
        {
            _context = context;
            _audit = audit;
        }
        // ── Fixed company ID for per-installation model ───────────────────────────
        // This is always 1 in a single-company installation.
        // If you ever go multi-tenant, replace this with a resolved tenant ID.
        private const int CompanyId = 1;

        // ─────────────────────────────────────────────────────────────────────────
        // CREATE
        // ─────────────────────────────────────────────────────────────────────────
        public async Task<(ClientDto? Data, string? Error)> CreateClientAsync(
            CreateClientRequest request, int userId)
        {
            // Prevent duplicate NIF within the same company
            //if (!string.IsNullOrWhiteSpace(request.NIF))
            //{
            //    var nifExists = await db.Clients.AnyAsync(c =>
            //        c.CompanyId == CompanyId &&
            //        c.NIF == request.NIF.Trim() &&
            //        !c.IsArchived);

            //    if (nifExists)
            //        return (null, $"Un client avec le NIF '{request.NIF}' existe déjà.");
            //}

            var client = new Client
            {
                CompanyId = CompanyId,
                Type = request.Type,
                LegalName = request.LegalName.Trim(),
                LastName = request.LastName?.Trim(),
                FirstName = request.FirstName?.Trim(),
                Email = request.Email?.Trim().ToLower(),
                Tel = request.Tel?.Trim(),
                Adresse = request.Adresse?.Trim(),
                RC = request.RC?.Trim(),
                AI = request.AI?.Trim(),
                NIF = request.NIF?.Trim(),
                NIS = request.NIS?.Trim(),
                N_BL = request.N_BL?.Trim(),
                N_BP = request.N_BP?.Trim(),
               
                IsArchived = false,
                CreatedAt = DateTime.UtcNow,
            };

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            await _audit.LogAsync(
                userId: userId,
                entityType: "Client",
                entityId: client.Id,
                action: "Created",
                newValue: JsonSerializer.Serialize(new { client.LegalName, client.NIF, client.Type }),
                details: $"Client '{client.LegalName}' créé."
            );

            return (MapToDto(client), null);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // UPDATE
        // ─────────────────────────────────────────────────────────────────────────
        public async Task<(ClientDto? Data, string? Error)> UpdateClientAsync(
            int clientId, UpdateClientRequest request, int userId)
        {
            var client = await _context.Clients.FindAsync(clientId);
            if (client is null || client.CompanyId != CompanyId)
                return (null, "Client introuvable.");

            if (client.IsArchived)
                return (null, "Impossible de modifier un client archivé. Restaurez-le d'abord.");

            // NIF uniqueness check — exclude current client from check
            if (!string.IsNullOrWhiteSpace(request.NIF))
            {
                var nifTaken = await _context.Clients.AnyAsync(c =>
                    c.CompanyId == CompanyId &&
                    c.NIF == request.NIF.Trim() &&
                    c.Id != clientId &&
                    !c.IsArchived);

                if (nifTaken)
                    return (null, $"Un autre client avec le NIF '{request.NIF}' existe déjà.");
            }

            // Snapshot before for audit
            var before = JsonSerializer.Serialize(new
            {
                client.LegalName,
                client.Type,
                client.Email,
                client.Tel,
                client.NIF,
                client.Adresse
            });

            client.Type = request.Type;
            client.LegalName = request.LegalName.Trim();
            client.LastName = request.LastName?.Trim();
            client.FirstName = request.FirstName?.Trim();
            client.Email = request.Email?.Trim().ToLower();
            client.Tel = request.Tel?.Trim();
            client.Adresse = request.Adresse?.Trim();
            client.RC = request.RC?.Trim();
            client.AI = request.AI?.Trim();
            client.NIF = request.NIF?.Trim();
            client.NIS = request.NIS?.Trim();
            client.N_BL = request.N_BL?.Trim();
            client.N_BP = request.N_BP?.Trim();
            

            await _context.SaveChangesAsync();

            var after = JsonSerializer.Serialize(new
            {
                client.LegalName,
                client.Type,
                client.Email,
                client.Tel,
                client.NIF,
                client.Adresse
            });

            await _audit.LogAsync(
                userId: userId,
                entityType: "Client",
                entityId: client.Id,
                action: "Updated",
                oldValue: before,
                newValue: after
            );

            return (MapToDto(client), null);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // ARCHIVE  (soft delete)
        // ─────────────────────────────────────────────────────────────────────────
        public async Task<(bool Success, string? Error)> ArchiveClientAsync(int clientId, int userId)
        {
            var client = await _context.Clients.FindAsync(clientId);
            if (client is null || client.CompanyId != CompanyId)
                return (false, "Client introuvable.");

            if (client.IsArchived)
                return (false, "Ce client est déjà archivé.");

            // Warn if client has unpaid invoices — still allow archive but note it
            var hasUnpaidInvoices = await _context.Invoices.AnyAsync(i =>
                i.ClientId == clientId &&
                (i.Status == InvoiceStatus.Sent || i.Status == InvoiceStatus.Overdue));

            client.IsArchived = true;
            client.ArchivedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _audit.LogAsync(
                userId: userId,
                entityType: "Client",
                entityId: client.Id,
                action: "Archived",
                details: hasUnpaidInvoices
                    ? $"Client '{client.LegalName}' archivé — attention: factures impayées existantes."
                    : $"Client '{client.LegalName}' archivé."
            );

            return (true, null);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // RESTORE
        // ─────────────────────────────────────────────────────────────────────────
        public async Task<(bool Success, string? Error)> RestoreClientAsync(int clientId, int userId)
        {
            var client = await _context.Clients.FindAsync(clientId);
            if (client is null || client.CompanyId != CompanyId)
                return (false, "Client introuvable.");

            if (!client.IsArchived)
                return (false, "Ce client n'est pas archivé.");

            client.IsArchived = false;
            client.ArchivedAt = null;
            await _context.SaveChangesAsync();

            await _audit.LogAsync(
                userId: userId,
                entityType: "Client",
                entityId: client.Id,
                action: "Restored",
                details: $"Client '{client.LegalName}' restauré."
            );

            return (true, null);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // GET SINGLE CLIENT
        // ─────────────────────────────────────────────────────────────────────────
        public async Task<(ClientDto? Data, string? Error)> GetClientAsync(int clientId)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == clientId && c.CompanyId == CompanyId);

            if (client is null)
                return (null, "Client introuvable.");

            return (MapToDto(client), null);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // GET ALL  (paginated + search + filter — merged into one method)
        // ─────────────────────────────────────────────────────────────────────────
        public async Task<ClientPagedResult> GetAllClientsAsync(ClientQueryRequest query)
        {
            var q = _context.Clients
                .Where(c => c.CompanyId == CompanyId)
                .AsQueryable();

            // Archive filter
            if (!query.IncludeArchived)
                q = q.Where(c => !c.IsArchived);

            // Type filter
            if (query.Type.HasValue)
                q = q.Where(c => c.Type == query.Type.Value);

            // Search — across the fields a user would actually type
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var term = query.Search.Trim().ToLower();
                q = q.Where(c =>
                    c.LegalName.ToLower().Contains(term) ||
                    (c.FirstName != null && c.FirstName.ToLower().Contains(term)) ||
                    (c.LastName != null && c.LastName.ToLower().Contains(term)) ||
                    (c.NIF != null && c.NIF.Contains(term)) ||
                    (c.Tel != null && c.Tel.Contains(term)) ||
                    (c.Email != null && c.Email.ToLower().Contains(term))
                );
            }

            var totalCount = await q.CountAsync();

            // Invoice count subquery — avoids N+1
            var items = await q
                .OrderByDescending(c => c.CreatedAt)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(c => new ClientSummaryDto(
                    c.Id,
                    c.Type,
                    c.LegalName,
                    c.FirstName,
                    c.LastName,
                    c.Tel,
                    c.Email,
                    c.NIF,
                    c.IsArchived,
                    c.Invoices.Count,
                    c.CreatedAt
                ))
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)totalCount / query.PageSize);

            return new ClientPagedResult(items, totalCount, query.Page, query.PageSize, totalPages);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // GET CLIENT STATS
        // ─────────────────────────────────────────────────────────────────────────
        public async Task<(ClientStatsDto? Data, string? Error)> GetClientStatsAsync(int clientId)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == clientId && c.CompanyId == CompanyId);

            if (client is null)
                return (null, "Client introuvable.");

            var invoices = await _context.Invoices
                .Where(i => i.ClientId == clientId)
                .ToListAsync();

            var payments = await _context.Payments
                .Where(p => _context.Invoices
                    .Where(i => i.ClientId == clientId)
                    .Select(i => i.Id)
                    .Contains(p.InvoiceId))
                .ToListAsync();

            var totalInvoicedTTC = invoices.Sum(i => i.TTC);
            var totalPaid = payments.Sum(p => p.Amount);

            var stats = new ClientStatsDto(
                ClientId: clientId,
                ClientName: client.LegalName,
                TotalInvoices: invoices.Count,
                PaidInvoices: invoices.Count(i => i.Status == InvoiceStatus.Paid),
                PendingInvoices: invoices.Count(i => i.Status == InvoiceStatus.Sent || i.Status == InvoiceStatus.Draft),
                OverdueInvoices: invoices.Count(i => i.Status == InvoiceStatus.Overdue),
                TotalInvoicedTTC: totalInvoicedTTC,
                TotalPaid: totalPaid,
                TotalOutstanding: totalInvoicedTTC - totalPaid
            );

            return (stats, null);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // GET CLIENT INVOICES
        // ─────────────────────────────────────────────────────────────────────────
        public async Task<(List<ClientInvoiceRowDto>? Data, string? Error)> GetClientInvoicesAsync(int clientId)
        {
            var clientExists = await _context.Clients
                .AnyAsync(c => c.Id == clientId && c.CompanyId == CompanyId);

            if (!clientExists)
                return (null, "Client introuvable.");

            var invoices = await _context.Invoices
                .Where(i => i.ClientId == clientId)
                .OrderByDescending(i => i.InvoiceDate)
                .Select(i => new
                {
                    i.Id,
                    i.InvoiceNumber,
                    i.InvoiceDate,
                    i.DueDate,
                    i.Status,
                    i.TTC,
                    AmountPaid = i.Payments.Sum(p => p.Amount)
                })
                .ToListAsync();

            var rows = invoices.Select(i => new ClientInvoiceRowDto(
                Id: i.Id,
                InvoiceNumber: i.InvoiceNumber,
                InvoiceDate: i.InvoiceDate,
                DueDate: i.DueDate,
                Status: i.Status,
                TTC: i.TTC,
                AmountPaid: i.AmountPaid,
                AmountOutstanding: i.TTC - i.AmountPaid
            )).ToList();

            return (rows, null);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // PRIVATE MAPPER
        // ─────────────────────────────────────────────────────────────────────────
        private static ClientDto MapToDto(Client c) => new(
            c.Id, c.Type, c.LegalName, c.LastName, c.FirstName,
            c.Email, c.Tel, c.Adresse,
            c.RC, c.AI, c.NIF, c.NIS, c.N_BL, c.N_BP,
            c.IsArchived, c.ArchivedAt, c.CreatedAt
        );
    }
}
