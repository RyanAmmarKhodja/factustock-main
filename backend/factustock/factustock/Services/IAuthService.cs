namespace factustock.Services
{
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;
    using System.Text.Json;
    using factustock.Data;
    using factustock.DTOs;
    using factustock.Models;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.IdentityModel.Tokens;

 

    // ─────────────────────────────────────────────
    // INTERFACE
    // ─────────────────────────────────────────────
    public interface IAuthService
    {
        /// <summary>
        /// Returns current setup state. React calls this on app load
        /// to decide whether to show admin setup or login page.
        /// </summary>
        

        /// <summary>
        /// One-time admin registration. Fails if admin already exists.
        /// </summary>
        Task<(RegisterResponse? Data, string? Error)> RegisterAdminAsync(RegisterRequest request, string? ipAddress);
        Task<(CompanyDto? Data, string? Error)> RegisterCompanyAsync(CompanyDto request);

        /// <summary>
        /// Admin creates an employee account. Enforces seat limit.
        /// </summary>
        Task<(RegisterResponse? Data, string? Error)> RegisterEmployeeAsync(CreateEmployeeRequest request, int adminUserId, string? ipAddress);

        Task<(LoginResponse? Data, string? Error)> LoginAsync(LoginRequest request, string? ipAddress);

        Task<(bool Success, string? Error)> ChangePasswordAsync(int userId, ChangePasswordRequest request, string? ipAddress);

        Task<UserListResponse> GetUsersAsync();

        Task<(UserDto? Data, string? Error)> UpdateUserAsync(int targetUserId, UpdateUserRequest request, int adminUserId, string? ipAddress);

        /// <summary>
        /// Deactivating frees up a seat. Does not delete data.
        /// </summary>
        Task<(bool Success, string? Error)> DeactivateUserAsync(int targetUserId, int adminUserId, string? ipAddress);

        
    }


    }
