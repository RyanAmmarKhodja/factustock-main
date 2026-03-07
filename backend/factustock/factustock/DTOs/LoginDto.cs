namespace factustock.DTOs
{
 
    // ════════════════════════════════════════════
    // AUTH
    // ════════════════════════════════════════════
    public record LoginRequest(string Email, string Password);

    public record LoginResponse(
        int UserId,
        string Email,
        string FirstName,
        string LastName,
        string Role,
        string Token
    );
}
