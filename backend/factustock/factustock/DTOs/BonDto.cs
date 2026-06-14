namespace factustock.DTOs
{
    // ════════════════════════════════════════════
    // BON (Livraison / Réception / Commande)
    // ════════════════════════════════════════════

    public record GenerateBonRequest(
        int BonType,                // 0 = BL, 1 = BR, 2 = BC
        int? ClientId,
        string? ClientLegalName,
        string? ClientAddress,
        string? ClientTel,
        string? ClientNIF,
        string? ClientAI,
        string? ClientRC,
        string? ClientNIS,
        DateTime BonDate,
        string? Notes,
        List<BonLineRequest> Lines
    );

    public record BonLineRequest(
        int ProductId,
        decimal Quantity,
        decimal? PricePerUnitOverride,
        decimal? TVAOverride
    );

    public record GenerateBonResponse(
        int BonId,
        string BonNumber,
        decimal TotalHorsTaxe,
        decimal TotalTVA,
        decimal TTC,
        string PdfDownloadUrl,
        DateTime GeneratedAt
    );

    public record BonListItem(
        int Id,
        string BonNumber,
        string BonType,
        DateTime BonDate,
        int? ClientId,
        string? ClientLegalName,
        decimal TotalHorsTaxe,
        decimal TTC,
        string CreatedByUser,
        DateTime CreatedAt
    );

    public record BonPagedResult(
        List<BonListItem> Items,
        int TotalCount,
        int Page,
        int PageSize,
        int TotalPages
    );

    public record BonDetailDto(
        int Id,
        string BonNumber,
        string BonType,
        DateTime BonDate,
        int? ClientId,
        string? ClientLegalName,
        string? ClientAddress,
        string? ClientTel,
        string? ClientNIF,
        string? ClientAI,
        string? ClientRC,
        string? ClientNIS,
        decimal TotalHorsTaxe,
        decimal TTC,
        string? Notes,
        string? PdfDownloadUrl,
        string CreatedByUser,
        DateTime CreatedAt,
        List<BonItemDto> Items
    );

    public record BonItemDto(
        int Id,
        int ProductId,
        string? Code,
        string Designation,
        decimal Quantity,
        string? Unit,
        decimal PricePerUnit,
        decimal TVA,
        decimal PriceHorsTaxe,
        decimal PriceTTC
    );

    // Used by BonTemplate to render the PDF
    public record BonDocument(
        string BonNumber,
        string BonTypeLabel,    // "BON DE LIVRAISON" / "BON DE RÉCEPTION" / "BON DE COMMANDE"
        DateTime BonDate,
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
}
