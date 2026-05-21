namespace factustock.DTOs
{
    using factustock.Enums;
    using System.ComponentModel.DataAnnotations;


    // ════════════════════════════════════════════
    // REQUEST
    // ════════════════════════════════════════════

    /// <summary>
    /// Sent by React when user clicks "Générer la facture".
    /// N_Facture and totals are NOT sent by the client —
    /// they are computed and assigned server-side.
    /// </summary>
    public record GenerateInvoiceRequest(
        [Required] int ClientId,
        [Required] DateTime InvoiceDate,
        [Required] DateTime DueDate,
        [Required] PaymentMethod PaymentMethod,
        [Required][MinLength(1)]
               List<InvoiceLineRequest> Lines,
        string? Notes
    );

    /// <summary>
    /// One line item from the form.
    /// PricePerUnitOverride: if null, use the product's current catalogue price.
    /// TVAOverride: if null, use the product's DefaultTaxRate.
    /// This lets the user adjust price/TVA per line without changing the catalogue.
    /// </summary>
    public record InvoiceLineRequest(
        [Required] int ProductId,
        [Required][Range(0.001, double.MaxValue)] decimal Quantity,
        decimal? PricePerUnitOverride,
        decimal? TVAOverride
    );

    // ════════════════════════════════════════════
    // RESPONSE
    // ════════════════════════════════════════════

    /// <summary>
    /// Returned after successful generation.
    /// React uses this to show a success message and trigger download.
    /// </summary>
    public record GenerateInvoiceResponse(
        int InvoiceId,
        string InvoiceNumber,      // e.g. "2025/001"
        decimal TotalHorsTaxe,
        decimal TotalTVA,
        decimal TTC,
        string PdfDownloadUrl,     // e.g. /api/documents/invoice/42/pdf
        DateTime GeneratedAt
    );

    // ════════════════════════════════════════════
    // INTERNAL — used inside the service and template
    // not exposed to the API consumer
    // ════════════════════════════════════════════

    /// <summary>
    /// Fully resolved invoice data passed to QuestPDF template.
    /// Everything the template needs — no DB calls inside the template.
    /// </summary>
    public record InvoiceDocument(
        // Header
        string InvoiceNumber,
        DateTime InvoiceDate,
        DateTime DueDate,
        string PaymentMethodLabel,

        // Company (seller) coordinates
        CompanyCoordinates Seller,

        // Client (buyer) coordinates
        ClientCoordinates Buyer,

        // Line items
        List<InvoiceLineResolved> Lines,

        // Totals
        List<TVABreakdown> TVABreakdownLines,    // one row per TVA rate
        decimal TotalHorsTaxe,
        decimal TotalTVA,
        decimal TTC,

        // Footer
        string? Notes,
        string GeneratedLabel                  // "Document généré le DD/MM/YYYY"
    );

    /// <summary>Company coordinates for the invoice header.</summary>
    public record CompanyCoordinates(
        string Name,
        string LegalName,
        string? Adresse,
        string? Tel,
        string? Email,
        string? RC,
        string? AI,
        string? NIF,
        string? NIS,
        string? LogoUrl
    );

    /// <summary>Client coordinates for the invoice header.</summary>
    public record ClientCoordinates(
        string LegalName,
        string? FirstName,
        string? LastName,
        string? Adresse,
        string? Tel,
        string? Email,
        string? RC,
        string? NIF,
        string? NIS
    );

    /// <summary>
    /// One fully resolved line item — prices are snapshots, not live catalogue values.
    /// </summary>
    public record InvoiceLineResolved(
        string Reference,
        string Designation,
        decimal Quantity,
        string? Unit,
        decimal PricePerUnit,
        decimal TVARate,
        decimal PriceHorsTaxe,     // Quantity * PricePerUnit
        decimal TVAAmount,          // PriceHorsTaxe * TVARate / 100
        decimal PriceTTC            // PriceHorsTaxe + TVAAmount
    );

    /// <summary>
    /// TVA breakdown row for the totals block.
    /// Algerian factures must show each TVA rate separately.
    /// e.g. "Base 9%: 50 000 DA  |  TVA 9%: 4 500 DA"
    /// </summary>
    public record TVABreakdown(
        decimal Rate,                // e.g. 19.00
        decimal BaseHT,              // sum of HT for lines at this rate
        decimal TVAAmount            // BaseHT * Rate / 100
    );
}