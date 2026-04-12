using factustock.Data;
using factustock.DTOs;
using factustock.Enums;
using factustock.Models;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace factustock.Services
{
    public class SupplierService : ISupplierService
    {
            private readonly AppDbContext _context;
            private readonly IAuditService _audit;
            public SupplierService(AppDbContext context, IAuditService audit)
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
            public async Task<(SupplierDto? Data, string? Error)> CreateSupplierAsync(
                CreateSupplierRequest request, int userId)
            {
                
                var supplier = new Supplier
                {
                    CompanyId = CompanyId,
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

                _context.Suppliers.Add(supplier);
                await _context.SaveChangesAsync();

                await _audit.LogAsync(
                    userId: userId,
                    entityType: "Supplier",
                    entityId: supplier.Id,
                    action: "Created",
                    newValue: JsonSerializer.Serialize(new { supplier.LegalName, supplier.NIF }),
                    details: $"Supplier '{supplier.LegalName}' créé."
                );

                return (MapToDto(supplier), null);
            }

            // ─────────────────────────────────────────────────────────────────────────
            // UPDATE
            // ─────────────────────────────────────────────────────────────────────────
            public async Task<(SupplierDto? Data, string? Error)> UpdateSupplierAsync(
                int supplierId, UpdateSupplierRequest request, int userId)
            {
                var supplier = await _context.Suppliers.FindAsync(supplierId);
                if (supplier is null || supplier.CompanyId != CompanyId)
                    return (null, "Supplier introuvable.");

                if (supplier.IsArchived)
                    return (null, "Impossible de modifier un supplier archivé. Restaurez-le d'abord.");

                // NIF uniqueness check — exclude current supplier from check
                if (!string.IsNullOrWhiteSpace(request.NIF))
                {
                    var nifTaken = await _context.Suppliers.AnyAsync(c =>
                        c.CompanyId == CompanyId &&
                        c.NIF == request.NIF.Trim() &&
                        c.Id != supplierId &&
                        !c.IsArchived);

                    if (nifTaken)
                        return (null, $"Un autre supplier avec le NIF '{request.NIF}' existe déjà.");
                }

                // Snapshot before for audit
                var before = JsonSerializer.Serialize(new
                {
                    supplier.LegalName,
                    supplier.Email,
                    supplier.Tel,
                    supplier.NIF,
                    supplier.Adresse
                });

                supplier.LegalName = request.LegalName.Trim();
                supplier.LastName = request.LastName?.Trim();
                supplier.FirstName = request.FirstName?.Trim();
                supplier.Email = request.Email?.Trim().ToLower();
                supplier.Tel = request.Tel?.Trim();
                supplier.Adresse = request.Adresse?.Trim();
                supplier.RC = request.RC?.Trim();
                supplier.AI = request.AI?.Trim();
                supplier.NIF = request.NIF?.Trim();
                supplier.NIS = request.NIS?.Trim();
                supplier.N_BL = request.N_BL?.Trim();
                supplier.N_BP = request.N_BP?.Trim();


                await _context.SaveChangesAsync();

                var after = JsonSerializer.Serialize(new
                {
                    supplier.LegalName,
                    supplier.Email,
                    supplier.Tel,
                    supplier.NIF,
                    supplier.Adresse
                });

                await _audit.LogAsync(
                    userId: userId,
                    entityType: "Supplier",
                    entityId: supplier.Id,
                    action: "Updated",
                    oldValue: before,
                    newValue: after
                );

                return (MapToDto(supplier), null);
            }

            // ─────────────────────────────────────────────────────────────────────────
            // ARCHIVE  (soft delete)
            // ─────────────────────────────────────────────────────────────────────────
            public async Task<(bool Success, string? Error)> ArchiveSupplierAsync(int supplierId, int userId)
            {
                var supplier = await _context.Suppliers.FindAsync(supplierId);
                if (supplier is null || supplier.CompanyId != CompanyId)
                    return (false, "Supplier introuvable.");
                if (supplier.IsArchived)
                    return (false, "Ce supplier est déjà archivé.");

                // Warn if supplier has unpaid invoices — still allow archive but note it
                // var hasUnpaidInvoices = await _context.Invoices.AnyAsync(i =>
                //    i.SupplierId == supplierId &&
                //    (i.Status == InvoiceStatus.Sent || i.Status == InvoiceStatus.Overdue));

                supplier.IsArchived = true;
                supplier.ArchivedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                await _audit.LogAsync(
                    userId: userId,
                    entityType: "Supplier",
                    entityId: supplier.Id,
                    action: "Archived",
                    details: $"Fournisseur '{supplier.LegalName}' archivé."
                );

                return (true, null);
            }

            // ─────────────────────────────────────────────────────────────────────────
            // RESTORE
            // ─────────────────────────────────────────────────────────────────────────
            public async Task<(bool Success, string? Error)> RestoreSupplierAsync(int supplierId, int userId)
            {
                var supplier = await _context.Suppliers.FindAsync(supplierId);
                if (supplier is null || supplier.CompanyId != CompanyId)
                    return (false, "Supplier introuvable.");
                if (!supplier.IsArchived)
                    return (false, "Ce supplier n'est pas archivé.");

                supplier.IsArchived = false;
                supplier.ArchivedAt = null;
                await _context.SaveChangesAsync();

                await _audit.LogAsync(
                    userId: userId,
                    entityType: "Supplier",
                    entityId: supplier.Id,
                    action: "Restored",
                    details: $"Supplier '{supplier.LegalName}' restauré."
                );

                return (true, null);
            }

            // ─────────────────────────────────────────────────────────────────────────
            // GET SINGLE SUPPLIER
            // ─────────────────────────────────────────────────────────────────────────
            public async Task<(SupplierDto? Data, string? Error)> GetSupplierAsync(int supplierId)
            {
                var supplier = await _context.Suppliers
                    .FirstOrDefaultAsync(s => s.Id == supplierId && s.CompanyId == CompanyId);

                if (supplier is null)
                    return (null, "Supplier introuvable.");

                return (MapToDto(supplier), null);
            }

            // ─────────────────────────────────────────────────────────────────────────
            // GET ALL  (paginated + search + filter — merged into one method)
            // ─────────────────────────────────────────────────────────────────────────
            public async Task<SupplierPagedResult> GetAllSuppliersAsync(SupplierQueryRequest query)
            {
                var q = _context.Suppliers
                    .Where(s => s.CompanyId == CompanyId)
                    .AsQueryable();

                // Archive filter
                if (!query.IncludeArchived)
                    q = q.Where(s => !s.IsArchived);

                // Search — across the fields a user would actually type
                if (!string.IsNullOrWhiteSpace(query.Search))
                {
                    var term = query.Search.Trim().ToLower();
                    q = q.Where(s =>
                        s.LegalName.ToLower().Contains(term) ||
                        (s.FirstName != null && s.FirstName.ToLower().Contains(term)) ||
                        (s.LastName != null && s.LastName.ToLower().Contains(term)) ||
                        (s.NIF != null && s.NIF.Contains(term)) ||
                        (s.Tel != null && s.Tel.Contains(term)) ||
                        (s.Email != null && s.Email.ToLower().Contains(term))
                    );
                }

                var totalCount = await q.CountAsync();

                // Invoice count subquery — avoids N+1
                var items = await q
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((query.Page - 1) * query.PageSize)
                    .Take(query.PageSize)
                    .Select(s => new SupplierSummaryDto(
                        s.Id,
                        s.LegalName,
                        s.FirstName,
                        s.LastName,
                        s.Tel,
                        s.Email,
                        s.NIF,
                        s.IsArchived,
                        s.Invoices.Count,
                        s.CreatedAt
                    ))
                    .ToListAsync();

                var totalPages = (int)Math.Ceiling((double)totalCount / query.PageSize);

                return new SupplierPagedResult(items, totalCount, query.Page, query.PageSize, totalPages);
            }

            // ─────────────────────────────────────────────────────────────────────────
            // GET SUPPLIER STATS
            // ─────────────────────────────────────────────────────────────────────────
            //public async Task<(SupplierStatsDto? Data, string? Error)> GetSupplierStatsAsync(int supplierId)
            //{
            //    var supplier = await _context.Suppliers
            //        .FirstOrDefaultAsync(s => s.Id == supplierId && s.CompanyId == CompanyId);

            //    if (supplier is null)
            //        return (null, "Supplier introuvable.");

            //    var invoices = await _context.Invoices
            //        .Where(i => i.SupplierId == supplierId)
            //        .ToListAsync();

            //    var payments = await _context.Payments
            //        .Where(p => _context.Invoices
            //            .Where(i => i.SupplierId == supplierId)
            //            .Select(i => i.Id)
            //            .Contains(p.InvoiceId))
            //        .ToListAsync();

            //    var totalInvoicedTTC = invoices.Sum(i => i.TTC);
            //    var totalPaid = payments.Sum(p => p.Amount);

            //    var stats = new SupplierStatsDto(
            //        SupplierId: supplierId,
            //        SupplierName: supplier.LegalName,
            //        TotalInvoices: invoices.Count,
            //        PaidInvoices: invoices.Count(i => i.Status == InvoiceStatus.Paid),
            //        PendingInvoices: invoices.Count(i => i.Status == InvoiceStatus.Sent || i.Status == InvoiceStatus.Draft),
            //        OverdueInvoices: invoices.Count(i => i.Status == InvoiceStatus.Overdue),
            //        TotalInvoicedTTC: totalInvoicedTTC,
            //        TotalPaid: totalPaid,
            //        TotalOutstanding: totalInvoicedTTC - totalPaid
            //    );

            //    return (stats, null);
            //}

            // ─────────────────────────────────────────────────────────────────────────
            // GET SUPPLIER INVOICES
            // ─────────────────────────────────────────────────────────────────────────
            //public async Task<(List<SupplierInvoiceRowDto>? Data, string? Error)> GetSupplierInvoicesAsync(int supplierId)
            //{
            //    var supplierExists = await _context.Suppliers
            //        .AnyAsync(s => s.Id == supplierId && s.CompanyId == CompanyId);

            //    if (!supplierExists)
            //        return (null, "Supplier introuvable.");

            //    var invoices = await _context.Invoices
            //        .Where(i => i.SupplierId == supplierId)
            //        .OrderByDescending(i => i.InvoiceDate)
            //        .Select(i => new
            //        {
            //            i.Id,
            //            i.InvoiceNumber,
            //            i.InvoiceDate,
            //            i.DueDate,
            //            i.Status,
            //            i.TTC,
            //            AmountPaid = i.Payments.Sum(p => p.Amount)
            //        })
            //        .ToListAsync();

            //    var rows = invoices.Select(i => new SupplierInvoiceRowDto(
            //        Id: i.Id,
            //        InvoiceNumber: i.InvoiceNumber,
            //        InvoiceDate: i.InvoiceDate,
            //        DueDate: i.DueDate,
            //        Status: i.Status,
            //        TTC: i.TTC,
            //        AmountPaid: i.AmountPaid,
            //        AmountOutstanding: i.TTC - i.AmountPaid
            //    )).ToList();

            //    return (rows, null);
            //}

            // ─────────────────────────────────────────────────────────────────────────
            // PRIVATE MAPPER
            // ─────────────────────────────────────────────────────────────────────────
            private static SupplierDto MapToDto(Supplier s) => new(
                s.Id, s.LegalName, s.LastName, s.FirstName,
                s.Email, s.Tel, s.Adresse,
                s.RC, s.AI, s.NIF, s.NIS, s.N_BL, s.N_BP,
                s.IsArchived, s.ArchivedAt, s.CreatedAt
            );
        }
}

