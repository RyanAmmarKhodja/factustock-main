using System.ComponentModel.DataAnnotations;

namespace factustock.DTOs;

// ─────────────────────────────────────────────
// AUTH DTOs
// ─────────────────────────────────────────────
/// <summary>
/// Used for BOTH admin first-time setup and employee registration.
/// Role is determined server-side based on context:
///   - If no admin exists → creates admin regardless of RoleId sent
///   - If admin exists → only admin can call this, creates employee
/// </summary>
public record RegisterRequest(
    [Required][EmailAddress] string Email,
    [Required][MinLength(8)] string Password,
    [Required] string FirstName,
    [Required] string LastName,
    string? Phone
);

public record RegisterResponse(
    int UserId,
    string Email,
    string FullName,
    string Role,
    DateTime CreatedAt
);

/// <summary>
/// Returned from the setup-status endpoint.
/// React uses this on app load to decide which page to show:
///   - IsAdminRegistered = false → show one-time admin setup page
///   - IsAdminRegistered = true  → show normal login page
/// </summary>
public record SetupStatusResponse(
    bool IsAdminRegistered,
    bool IsCompanyConfigured,
    string? CompanyName
);


public record RefreshTokenRequest([Required] string Token);

// ─────────────────────────────────────────────
// USER MANAGEMENT DTOs (admin creates employees)
// ─────────────────────────────────────────────

public record CreateEmployeeRequest(
    [Required][EmailAddress] string Email,
    [Required][MinLength(8)] string Password,
    [Required] string FirstName,
    [Required] string LastName,
    string? Phone
);


public record UserListResponse(
    List<UserDto> Users,
    int TotalCount,
    int MaxAllowed          // from the plan — so frontend can show "3 of 6 seats used"
);

public record LoginRequest(string Email, string Password);

public record LoginResponse(
    int UserId,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    string Token,
    DateTime TokenExpiry
);