namespace factustock.DTOs
{
    using factustock.Enums;
    using System.ComponentModel.DataAnnotations;


    // ════════════════════════════════════════════
    // INVOICE GENERATION — REQUEST / RESPONSE
    // ════════════════════════════════════════════

    /// <summary>
    /// Sent by React when user clicks "Créer la facture".
    /// ClientId is nullable — null means one-time client (snapshot fields are used directly).
    /// Totals are computed server-side, never sent by the client.
    /// </summary>
    public record GenerateInvoiceRequest(
        int? ClientId,              // null = one-time client not in DB
        string? ClientLegalName,    // required when ClientId is null
        string? ClientAddress,
        string? ClientTel,
        string? ClientEmail,
        string? ClientRC,
        string? ClientNIF,
        string? ClientNIS,
        string? ClientAI,
        [Required] DateTime InvoiceDate,
        DateTime? DueDate,          // optional
        [Required] PaymentMethod PaymentMethod,
        [Required][MinLength(1)] List<InvoiceLineRequest> Lines,
        string? Notes
    );

    /// <summary>One line item from the form.</summary>
    public record InvoiceLineRequest(
        [Required] int ProductId,
        [Required][Range(0.001, double.MaxValue)] decimal Quantity,
        decimal? PricePerUnitOverride,
        decimal? TVAOverride
    );

    /// <summary>Returned after successful generation.</summary>
    public record GenerateInvoiceResponse(
        int InvoiceId,
        string InvoiceNumber,
        decimal TotalHorsTaxe,
        decimal TotalTVA,
        decimal TTC,
        string PdfDownloadUrl,
        DateTime GeneratedAt
    );

    // ════════════════════════════════════════════
    // INTERNAL — used inside the service and template only
    // ════════════════════════════════════════════

    public record InvoiceDocument(
        string InvoiceNumber,
        DateTime InvoiceDate,
        DateTime? DueDate,
        string PaymentMethodLabel,
        CompanyCoordinates Seller,
        ClientCoordinates Buyer,
        List<InvoiceLineResolved> Lines,
        List<TVABreakdown> TVABreakdownLines,
        decimal TotalHorsTaxe,
        decimal TotalTVA,
        decimal TTC,
        string? Notes,
        string GeneratedLabel
    );

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

    public record InvoiceLineResolved(
        string Reference,
        string Designation,
        decimal Quantity,
        string? Unit,
        decimal PricePerUnit,
        decimal TVARate,
        decimal PriceHorsTaxe,
        decimal TVAAmount,
        decimal PriceTTC
    );

    public record TVABreakdown(
        decimal Rate,
        decimal BaseHT,
        decimal TVAAmount
    );
}
