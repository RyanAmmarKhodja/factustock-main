using factustock.Enums;

namespace factustock.DTOs
{
    // ════════════════════════════════════════════
    // CLIENT
    // ════════════════════════════════════════════
    public record CreateClientRequest(
        ClientType Type,
        string LegalName,
        string? LastName,
        string? FirstName,
        string? Email,
        string? Tel,
        string? Adresse,
        string? RC,
        string? AI,
        string? NIF,
        string? NIS,
        string? N_BL,
        string? N_BP,
        string? N_Facture
    );

    public record UpdateClientRequest(
        ClientType Type,
        string LegalName,
        string? LastName,
        string? FirstName,
        string? Email,
        string? Tel,
        string? Adresse,
        string? RC,
        string? AI,
        string? NIF,
        string? NIS,
        string? N_BL,
        string? N_BP,
        string? N_Facture
    );

    public record ClientDto(
        int Id,
        ClientType Type,
        string LegalName,
        string? LastName,
        string? FirstName,
        string? Email,
        string? Tel,
        string? Adresse,
        string? RC,
        string? NIF,
        string? NIS,
        DateTime CreatedAt
    );

}
