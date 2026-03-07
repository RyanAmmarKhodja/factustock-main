namespace factustock.DTOs
{
    // ════════════════════════════════════════════
    // COMPANY
    // ════════════════════════════════════════════
    public record UpdateCompanyRequest(
        string Name,
        string LegalName,
        string? Email,
        string? Tel,
        string? Adresse,
        string? RC,
        string? AI,
        string? NIF,
        string? NIS,
        string? N_BL,
        string? N_BP,
        string? N_Facture,
        string? LogoUrl,
        string? Website
    );

    public record CompanyDto(
        int Id,
        string Name,
        string LegalName,
        string? Email,
        string? Tel,
        string? Adresse,
        string? RC,
        string? AI,
        string? NIF,
        string? NIS,
        string? LogoUrl,
        string? Website,
        string PlanName,
        int MaxTotalAccounts,
        int CurrentUserCount,
        DateTime? PaidUntil
    );
}
