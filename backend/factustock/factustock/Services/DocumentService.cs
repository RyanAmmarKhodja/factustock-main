namespace factustock.Services
{
    using factustock.Data;
    using factustock.DTOs;
    using factustock.Enums;
    using factustock.Models;
    using Microsoft.EntityFrameworkCore;
    using QuestPDF.Fluent;
    using QuestPDF.Infrastructure;
    using System.Text.Json;
    using factustock.Templates;


    // ════════════════════════════════════════════
    // IMPLEMENTATION
    // ════════════════════════════════════════════
    public class DocumentService: IDocumentService
    {
        private const int CompanyId = 1;

        private readonly AppDbContext _context;
        private readonly IAuditService _audit;
        private readonly IConfiguration _config;

        public DocumentService(AppDbContext context, IAuditService audit, IConfiguration config)
        {
            _context = context;
            _audit = audit;
            _config = config;
        }

        // ─────────────────────────────────────────────────────────────────────────
        // GENERATE INVOICE
        // ─────────────────────────────────────────────────────────────────────────
        public async Task<(GenerateInvoiceResponse? Data, string? Error)> GenerateInvoiceAsync(
            GenerateInvoiceRequest request, int userId)
        {
            // ── 1. Validate client ────────────────────────────────────────────────
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == request.ClientId && c.CompanyId == CompanyId);

            if (client is null)
                return (null, "Client introuvable.");

            if (client.IsArchived)
                return (null, "Impossible de facturer un client archivé.");

            // ── 2. Validate and resolve line items ────────────────────────────────
            if (!request.Lines.Any())
                return (null, "La facture doit contenir au moins un article.");

            var productIds = request.Lines.Select(l => l.ProductId).Distinct().ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id) && p.CompanyId == CompanyId && p.Active)
                .ToListAsync();

            if (products.Count != productIds.Count)
                return (null, "Un ou plusieurs produits sont introuvables ou archivés.");

            var productMap = products.ToDictionary(p => p.Id);

            // ── 3. Auto-generate N_Facture (YYYY/NNN) ────────────────────────────
            var invoiceNumber = await GenerateInvoiceNumberAsync(request.InvoiceDate.Year);

            // ── 4. Compute line totals ────────────────────────────────────────────
            var resolvedLines = new List<InvoiceLineResolved>();
            var invoiceItems = new List<InvoiceItem>();

            foreach (var line in request.Lines)
            {
                var product = productMap[line.ProductId];
                var pricePerUnit = line.PricePerUnitOverride ?? product.Price;
                var tvaRate = line.TVAOverride ?? product.DefaultTaxRate;

                var priceHT = Math.Round(line.Quantity * pricePerUnit, 2);
                var tvaAmt = Math.Round(priceHT * tvaRate / 100, 2);
                var priceTTC = priceHT + tvaAmt;

                resolvedLines.Add(new InvoiceLineResolved(
                    Reference: product.Code,
                    Designation: product.Name,
                    Quantity: line.Quantity,
                    Unit: product.Unit,
                    PricePerUnit: pricePerUnit,
                    TVARate: tvaRate,
                    PriceHorsTaxe: priceHT,
                    TVAAmount: tvaAmt,
                    PriceTTC: priceTTC
                ));

                invoiceItems.Add(new InvoiceItem
                {
                    ProductId = product.Id,
                    Code = product.Code,
                    Designation = product.Name,
                    Quantity = line.Quantity,
                    Unit = product.Unit,
                    PricePerUnit = pricePerUnit,
                    TVA = tvaRate,
                    PriceHorsTaxe = priceHT,
                    PriceTTC = priceTTC,
                });
            }

            var totalHT = Math.Round(resolvedLines.Sum(l => l.PriceHorsTaxe), 2);
            var totalTVA = Math.Round(resolvedLines.Sum(l => l.TVAAmount), 2);
            var totalTTC = Math.Round(totalHT + totalTVA, 2);

            // TVA breakdown grouped by rate
            var tvaBreakdown = resolvedLines
                .GroupBy(l => l.TVARate)
                .OrderBy(g => g.Key)
                .Select(g => new TVABreakdown(
                    Rate: g.Key,
                    BaseHT: Math.Round(g.Sum(l => l.PriceHorsTaxe), 2),
                    TVAAmount: Math.Round(g.Sum(l => l.TVAAmount), 2)
                ))
                .ToList();

            // ── 5. Save Invoice + InvoiceItems to DB ─────────────────────────────
            var invoice = new Invoice
            {
                ClientId = request.ClientId,
                CompanyId = CompanyId,
                CreatedByUserId = userId,
                InvoiceNumber = invoiceNumber,
                InvoiceDate = request.InvoiceDate.Date,
                DueDate = request.DueDate.Date,
                Status = InvoiceStatus.Draft,
                PaymentMethod = request.PaymentMethod,
                TotalHorsTaxe = totalHT,
                TTC = totalTTC,
                Notes = request.Notes?.Trim(),
                GeneratedPdfPath = null,        // filled after PDF generation
                CreatedAt = DateTime.UtcNow,
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            // Attach invoice ID to items then save
            foreach (var item in invoiceItems)
                item.InvoiceId = invoice.Id;

            _context.InvoiceItems.AddRange(invoiceItems);
            await _context.SaveChangesAsync();

            // ── 6. Decrement stock for each line ──────────────────────────────────
            foreach (var line in request.Lines)
            {
                var product = productMap[line.ProductId];
                var before = product.StockQuantity;

                product.StockQuantity -= line.Quantity;

                _context.StockMovements.Add(new StockMovement
                {
                    ProductId = product.Id,
                    UserId = userId,
                    InvoiceId = invoice.Id,
                    Type = StockMovementType.Out,
                    Quantity = line.Quantity,
                    QuantityBefore = before,
                    QuantityAfter = product.StockQuantity,
                    Reason = $"Vente — Facture {invoiceNumber}",
                    CreatedAt = DateTime.UtcNow,
                });
            }

            await _context.SaveChangesAsync();

            // ── 7. Load company data for template header ──────────────────────────
            var company = await _context.Company.FindAsync(CompanyId)
                ?? throw new InvalidOperationException("Company record not found.");

            // ── 8. Build InvoiceDocument and render PDF ───────────────────────────
            var invoiceDoc = new InvoiceDocument(
                InvoiceNumber: invoiceNumber,
                InvoiceDate: invoice.InvoiceDate,
                DueDate: invoice.DueDate,
                PaymentMethodLabel: TranslatePaymentMethod(request.PaymentMethod),
                Seller: new CompanyCoordinates(
                    company.Name, company.LegalName, company.Adresse,
                    company.Tel, company.Email,
                    company.RC, company.AI, company.NIF, company.NIS,
                    company.LogoUrl
                ),
                Buyer: new ClientCoordinates(
                    client.LegalName, client.FirstName, client.LastName,
                    client.Address, client.Tel, client.Email,
                    client.RC, client.NIF, client.NIS
                ),
                Lines: resolvedLines,
                TVABreakdownLines: tvaBreakdown,
                TotalHorsTaxe: totalHT,
                TotalTVA: totalTVA,
                TTC: totalTTC,
                Notes: invoice.Notes,
                GeneratedLabel: $"Document généré le {DateTime.Now:dd/MM/yyyy à HH:mm}"
            );

            var pdfBytes = GeneratePdfBytes(invoiceDoc);

            // ── 9. Save PDF to disk ───────────────────────────────────────────────
            var pdfPath = await SavePdfAsync(pdfBytes, invoiceNumber, invoice.InvoiceDate.Year);
            var downloadUrl = $"/api/documents/invoice/{invoice.Id}/pdf";

            invoice.GeneratedPdfPath = pdfPath;
            await _context.SaveChangesAsync();

            // ── 10. Audit log ─────────────────────────────────────────────────────
            await _audit.LogAsync(
                userId: userId,
                entityType: "Invoice",
                entityId: invoice.Id,
                action: "Generated",
                newValue: JsonSerializer.Serialize(new
                {
                    invoice.InvoiceNumber,
                    invoice.TTC,
                    ClientId = request.ClientId,
                    Lines = request.Lines.Count
                }),
                details: $"Facture {invoiceNumber} générée — TTC: {totalTTC:N2} DA"
            );

            return (new GenerateInvoiceResponse(
                InvoiceId: invoice.Id,
                InvoiceNumber: invoiceNumber,
                TotalHorsTaxe: totalHT,
                TotalTVA: totalTVA,
                TTC: totalTTC,
                PdfDownloadUrl: downloadUrl,
                GeneratedAt: DateTime.UtcNow
            ), null);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // DOWNLOAD (re-serve stored PDF)
        // ─────────────────────────────────────────────────────────────────────────
        public async Task<(byte[]? Pdf, string? FileName, string? Error)> DownloadInvoiceAsync(
            int invoiceId)
        {
            var invoice = await _context.Invoices
                .FirstOrDefaultAsync(i => i.Id == invoiceId && i.CompanyId == CompanyId);

            if (invoice is null)
                return (null, null, "Facture introuvable.");

            if (string.IsNullOrEmpty(invoice.GeneratedPdfPath) || !File.Exists(invoice.GeneratedPdfPath))
                return (null, null, "Le fichier PDF de cette facture n'est pas disponible.");

            var bytes = await File.ReadAllBytesAsync(invoice.GeneratedPdfPath);
            var fileName = $"Facture-{invoice.InvoiceNumber.Replace("/", "-")}.pdf";

            return (bytes, fileName, null);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // PRIVATE HELPERS
        // ─────────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Generates next invoice number in format YYYY/NNN.
        /// Thread-safe: uses a DB query to find the current max within the year.
        /// </summary>
        private async Task<string> GenerateInvoiceNumberAsync(int year)
        {
            var prefix = $"{year}/";

            var lastNumber = await _context.Invoices
                .Where(i =>
                    i.CompanyId == CompanyId &&
                    i.InvoiceNumber.StartsWith(prefix))
                .Select(i => i.InvoiceNumber)
                .ToListAsync();

            // Parse existing sequence numbers and take max
            var maxSeq = lastNumber
                .Select(n =>
                {
                    var parts = n.Split('/');
                    return parts.Length == 2 && int.TryParse(parts[1], out var seq) ? seq : 0;
                })
                .DefaultIfEmpty(0)
                .Max();

            return $"{year}/{(maxSeq + 1):D3}";   // e.g. "2025/001", "2025/012"
        }

        /// <summary>
        /// Renders the QuestPDF template to bytes in memory.
        /// </summary>
        private static byte[] GeneratePdfBytes(InvoiceDocument invoiceDoc)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var template = new InvoiceTemplate(invoiceDoc);
            return template.GeneratePdf();
        }

        /// <summary>
        /// Saves PDF bytes to /storage/invoices/YYYY/filename.pdf.
        /// Returns the absolute file path for storage in DB.
        /// </summary>
        private async Task<string> SavePdfAsync(byte[] bytes, string invoiceNumber, int year)
        {
            var storageRoot = _config["Storage:InvoicesPath"] ?? "storage/invoices";
            var yearDir = Path.Combine(storageRoot, year.ToString());

            Directory.CreateDirectory(yearDir);

            var safeNumber = invoiceNumber.Replace("/", "-");   // "2025-001"
            var fileName = $"Facture-{safeNumber}.pdf";
            var fullPath = Path.Combine(yearDir, fileName);

            await File.WriteAllBytesAsync(fullPath, bytes);

            return fullPath;
        }

        /// <summary>
        /// Maps enum to French display label for the PDF.
        /// </summary>
        private static string TranslatePaymentMethod(PaymentMethod method) => method switch
        {
            PaymentMethod.Cash => "Espèces",
            PaymentMethod.BankTransfer => "Virement bancaire",
            PaymentMethod.Cheque => "Chèque",
            PaymentMethod.CIB => "Carte CIB",
            PaymentMethod.Edahabia => "Carte Edahabia",
            _ => method.ToString()
        };
    }
}
