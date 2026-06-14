using factustock.Data;
using factustock.DTOs;
using factustock.Enums;
using factustock.Models;
using factustock.Templates;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using System.Text.Json;

namespace factustock.Services
{
    public class BonService(
        AppDbContext _context,
        IAuditService _audit,
        IConfiguration _config) : IBonService
    {
        private const int CompanyId = 1;

        // ── GENERATE ──────────────────────────────────────────────────────────────
        public async Task<(GenerateBonResponse? Data, string? Error)> GenerateBonAsync(
            GenerateBonRequest request, int userId)
        {
            var bonType = (BonType)request.BonType;

            // ── 1. Resolve client snapshot ────────────────────────────────────────
            string? clientLegalName, clientAddress, clientTel, clientNIF, clientAI, clientRC, clientNIS;

            if (request.ClientId.HasValue)
            {
                var client = await _context.Clients
                    .FirstOrDefaultAsync(c => c.Id == request.ClientId.Value && c.CompanyId == CompanyId);

                if (client is null)  return (null, "Client introuvable.");
                if (client.IsArchived) return (null, "Impossible d'utiliser un client archivé.");

                clientLegalName = client.LegalName;
                clientAddress   = client.Address;
                clientTel       = client.Tel;
                clientNIF       = client.NIF;
                clientAI        = client.AI;
                clientRC        = client.RC;
                clientNIS       = client.NIS;
            }
            else
            {
                if (string.IsNullOrWhiteSpace(request.ClientLegalName))
                    return (null, "Le nom du client est obligatoire.");

                clientLegalName = request.ClientLegalName.Trim();
                clientAddress   = request.ClientAddress;
                clientTel       = request.ClientTel;
                clientNIF       = request.ClientNIF;
                clientAI        = request.ClientAI;
                clientRC        = request.ClientRC;
                clientNIS       = request.ClientNIS;
            }

            // ── 2. Validate and resolve line items ────────────────────────────────
            if (!request.Lines.Any())
                return (null, "Le bon doit contenir au moins un article.");

            var productIds = request.Lines.Select(l => l.ProductId).Distinct().ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id) && p.CompanyId == CompanyId && p.Active)
                .ToListAsync();

            if (products.Count != productIds.Count)
                return (null, "Un ou plusieurs produits sont introuvables ou archivés.");

            var productMap = products.ToDictionary(p => p.Id);

            // ── 3. Generate bon number (per type, per year) ───────────────────────
            var bonNumber = await GenerateBonNumberAsync(bonType, request.BonDate.Year);

            // ── 4. Compute line totals ────────────────────────────────────────────
            var resolvedLines = new List<InvoiceLineResolved>();
            var bonItems      = new List<BonItem>();

            foreach (var line in request.Lines)
            {
                var product     = productMap[line.ProductId];
                var pricePerUnit = line.PricePerUnitOverride ?? product.Price;
                var tvaRate     = line.TVAOverride ?? product.DefaultTaxRate;

                var priceHT  = Math.Round(line.Quantity * pricePerUnit, 2);
                var tvaAmt   = Math.Round(priceHT * tvaRate / 100, 2);
                var priceTTC = priceHT + tvaAmt;

                resolvedLines.Add(new InvoiceLineResolved(
                    Reference:      product.Code,
                    Designation:    product.Name,
                    Quantity:       line.Quantity,
                    Unit:           product.Unit,
                    PricePerUnit:   pricePerUnit,
                    TVARate:        tvaRate,
                    PriceHorsTaxe:  priceHT,
                    TVAAmount:      tvaAmt,
                    PriceTTC:       priceTTC
                ));

                bonItems.Add(new BonItem
                {
                    ProductId    = product.Id,
                    Code         = product.Code,
                    Designation  = product.Name,
                    Quantity     = line.Quantity,
                    Unit         = product.Unit,
                    PricePerUnit = pricePerUnit,
                    TVA          = tvaRate,
                    PriceHorsTaxe = priceHT,
                    PriceTTC     = priceTTC,
                });
            }

            var totalHT  = Math.Round(resolvedLines.Sum(l => l.PriceHorsTaxe), 2);
            var totalTVA = Math.Round(resolvedLines.Sum(l => l.TVAAmount), 2);
            var totalTTC = Math.Round(totalHT + totalTVA, 2);

            var tvaBreakdown = resolvedLines
                .GroupBy(l => l.TVARate)
                .OrderBy(g => g.Key)
                .Select(g => new TVABreakdown(
                    Rate:      g.Key,
                    BaseHT:    Math.Round(g.Sum(l => l.PriceHorsTaxe), 2),
                    TVAAmount: Math.Round(g.Sum(l => l.TVAAmount), 2)
                ))
                .ToList();

            // ── 5. Save Bon + BonItems ────────────────────────────────────────────
            var bon = new Bon
            {
                CompanyId       = CompanyId,
                CreatedByUserId = userId,
                Type            = bonType,
                BonNumber       = bonNumber,
                BonDate         = request.BonDate.Date,
                ClientId        = request.ClientId,
                ClientLegalName = clientLegalName,
                ClientAddress   = clientAddress,
                ClientTel       = clientTel,
                ClientNIF       = clientNIF,
                ClientAI        = clientAI,
                ClientRC        = clientRC,
                ClientNIS       = clientNIS,
                TotalHorsTaxe   = totalHT,
                TTC             = totalTTC,
                Notes           = request.Notes?.Trim(),
                CreatedAt       = DateTime.UtcNow,
            };

            _context.Bons.Add(bon);
            await _context.SaveChangesAsync();

            foreach (var item in bonItems) item.BonId = bon.Id;
            _context.BonItems.AddRange(bonItems);
            await _context.SaveChangesAsync();

            // ── 6. Build PDF ──────────────────────────────────────────────────────
            var company = await _context.Company.FindAsync(CompanyId)
                ?? throw new InvalidOperationException("Company record not found.");

            var bonDoc = new BonDocument(
                BonNumber:    bonNumber,
                BonTypeLabel: TypeLabel(bonType),
                BonDate:      bon.BonDate,
                Seller: new CompanyCoordinates(
                    company.Name, company.LegalName ?? company.Name, company.Adresse,
                    company.Tel, company.Email,
                    company.RC, company.AI, company.NIF, company.NIS,
                    company.LogoUrl
                ),
                Buyer: new ClientCoordinates(
                    clientLegalName ?? "",
                    null, null,
                    clientAddress,
                    clientTel,
                    null,
                    clientRC,
                    clientNIF,
                    clientNIS
                ),
                Lines:             resolvedLines,
                TVABreakdownLines: tvaBreakdown,
                TotalHorsTaxe:     totalHT,
                TotalTVA:          totalTVA,
                TTC:               totalTTC,
                Notes:             bon.Notes,
                GeneratedLabel:    $"Document généré le {DateTime.Now:dd/MM/yyyy à HH:mm}"
            );

            var pdfBytes = GeneratePdfBytes(bonDoc);
            var pdfPath  = await SavePdfAsync(pdfBytes, bonNumber, bon.BonDate.Year, bonType);

            bon.GeneratedPdfPath = pdfPath;
            await _context.SaveChangesAsync();

            var downloadUrl = $"/api/bons/{bon.Id}/pdf";

            // ── 7. Audit ──────────────────────────────────────────────────────────
            await _audit.LogAsync(
                userId:     userId,
                entityType: "Bon",
                entityId:   bon.Id,
                action:     "Generated",
                newValue:   JsonSerializer.Serialize(new { bon.BonNumber, bon.TTC, ClientName = clientLegalName }),
                details:    $"{TypeLabel(bonType)} {bonNumber} généré — TTC: {totalTTC:N2} DA"
            );

            return (new GenerateBonResponse(
                BonId:         bon.Id,
                BonNumber:     bonNumber,
                TotalHorsTaxe: totalHT,
                TotalTVA:      totalTVA,
                TTC:           totalTTC,
                PdfDownloadUrl: downloadUrl,
                GeneratedAt:   DateTime.UtcNow
            ), null);
        }

        // ── DOWNLOAD ──────────────────────────────────────────────────────────────
        public async Task<(byte[]? Pdf, string? FileName, string? Error)> DownloadBonAsync(int bonId)
        {
            var bon = await _context.Bons
                .FirstOrDefaultAsync(b => b.Id == bonId && b.CompanyId == CompanyId);

            if (bon is null)
                return (null, null, "Bon introuvable.");

            if (string.IsNullOrEmpty(bon.GeneratedPdfPath) || !File.Exists(bon.GeneratedPdfPath))
                return (null, null, "Le fichier PDF de ce bon n'est pas disponible.");

            var bytes    = await File.ReadAllBytesAsync(bon.GeneratedPdfPath);
            var fileName = $"{bon.BonNumber.Replace("/", "-")}.pdf";

            return (bytes, fileName, null);
        }

        // ── LIST ──────────────────────────────────────────────────────────────────
        public async Task<BonPagedResult> GetBonsAsync(
            string? search, string? type, int page, int pageSize)
        {
            var q = _context.Bons
                .Include(b => b.CreatedByUser)
                .Where(b => b.CompanyId == CompanyId)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                q = q.Where(b => b.BonNumber.Contains(search) ||
                                 (b.ClientLegalName != null && b.ClientLegalName.Contains(search)));

            if (!string.IsNullOrWhiteSpace(type))
                q = q.Where(b => b.Type.ToString() == type);

            var total = await q.CountAsync();

            var items = await q
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new BonListItem(
                    b.Id,
                    b.BonNumber,
                    b.Type.ToString(),
                    b.BonDate,
                    b.ClientId,
                    b.ClientLegalName,
                    b.TotalHorsTaxe,
                    b.TTC,
                    $"{b.CreatedByUser.FirstName} {b.CreatedByUser.LastName}",
                    b.CreatedAt
                ))
                .ToListAsync();

            return new BonPagedResult(items, total, page, pageSize,
                (int)Math.Ceiling((double)total / pageSize));
        }

        // ── DETAIL ────────────────────────────────────────────────────────────────
        public async Task<(BonDetailDto? Data, string? Error)> GetBonAsync(int bonId)
        {
            var bon = await _context.Bons
                .Include(b => b.Items)
                .Include(b => b.CreatedByUser)
                .FirstOrDefaultAsync(b => b.Id == bonId && b.CompanyId == CompanyId);

            if (bon is null) return (null, "Bon introuvable.");

            var dto = new BonDetailDto(
                Id:             bon.Id,
                BonNumber:      bon.BonNumber,
                BonType:        bon.Type.ToString(),
                BonDate:        bon.BonDate,
                ClientId:       bon.ClientId,
                ClientLegalName: bon.ClientLegalName,
                ClientAddress:  bon.ClientAddress,
                ClientTel:      bon.ClientTel,
                ClientNIF:      bon.ClientNIF,
                ClientAI:       bon.ClientAI,
                ClientRC:       bon.ClientRC,
                ClientNIS:      bon.ClientNIS,
                TotalHorsTaxe:  bon.TotalHorsTaxe,
                TTC:            bon.TTC,
                Notes:          bon.Notes,
                PdfDownloadUrl: $"/api/bons/{bon.Id}/pdf",
                CreatedByUser:  $"{bon.CreatedByUser.FirstName} {bon.CreatedByUser.LastName}",
                CreatedAt:      bon.CreatedAt,
                Items: bon.Items.Select(i => new BonItemDto(
                    i.Id, i.ProductId, i.Code, i.Designation,
                    i.Quantity, i.Unit, i.PricePerUnit, i.TVA,
                    i.PriceHorsTaxe, i.PriceTTC
                )).ToList()
            );

            return (dto, null);
        }

        // ── PRIVATE HELPERS ───────────────────────────────────────────────────────

        private async Task<string> GenerateBonNumberAsync(BonType type, int year)
        {
            var prefix = TypePrefix(type);
            var fullPrefix = $"{prefix}-{year}/";

            var existingNumbers = await _context.Bons
                .Where(b => b.CompanyId == CompanyId && b.BonNumber.StartsWith(fullPrefix))
                .Select(b => b.BonNumber)
                .ToListAsync();

            var maxSeq = existingNumbers
                .Select(n =>
                {
                    // Format: "BL-2026/001" — extract last segment
                    var lastSlash = n.LastIndexOf('/');
                    return lastSlash >= 0 && int.TryParse(n[(lastSlash + 1)..], out var seq) ? seq : 0;
                })
                .DefaultIfEmpty(0)
                .Max();

            return $"{prefix}-{year}/{(maxSeq + 1):D3}";
        }

        private static string TypePrefix(BonType type) => type switch
        {
            BonType.BonLivraison => "BL",
            BonType.BonReception => "BR",
            BonType.BonCommande  => "BC",
            _ => "BX"
        };

        private static string TypeLabel(BonType type) => type switch
        {
            BonType.BonLivraison => "BON DE LIVRAISON",
            BonType.BonReception => "BON DE RÉCEPTION",
            BonType.BonCommande  => "BON DE COMMANDE",
            _ => "BON"
        };

        private static byte[] GeneratePdfBytes(BonDocument bonDoc)
        {
            QuestPDF.Settings.License = LicenseType.Community;
            return new BonTemplate(bonDoc).GeneratePdf();
        }

        private async Task<string> SavePdfAsync(byte[] bytes, string bonNumber, int year, BonType type)
        {
            var storageRoot = _config["Storage:BonsPath"] ?? "storage/bons";
            var yearDir     = Path.Combine(storageRoot, year.ToString());
            Directory.CreateDirectory(yearDir);

            var safeNumber = bonNumber.Replace("/", "-");
            var fileName   = $"{safeNumber}.pdf";
            var fullPath   = Path.Combine(yearDir, fileName);

            await File.WriteAllBytesAsync(fullPath, bytes);
            return fullPath;
        }
    }
}
