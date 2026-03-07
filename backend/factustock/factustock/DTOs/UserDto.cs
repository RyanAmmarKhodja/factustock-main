namespace factustock.DTOs
{// ════════════════════════════════════════════
 // USER
 // ════════════════════════════════════════════
    public record CreateUserRequest(
        string Email,
        string Password,
        string FirstName,
        string LastName,
        string? Phone,
        int RoleId
    );

    public record UpdateUserRequest(
        string FirstName,
        string LastName,
        string? Phone,
        int RoleId,
        bool Active
    );

    public record ChangePasswordRequest(
        string CurrentPassword,
        string NewPassword
    );

    public record UserDto(
        int Id,
        string Email,
        string FirstName,
        string LastName,
        string? Phone,
        string Role,
        bool Active,
        DateTime CreatedAt,
        DateTime? LastLoginAt
    );
}
