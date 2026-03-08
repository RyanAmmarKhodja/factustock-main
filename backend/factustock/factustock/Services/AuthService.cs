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
        Task<SetupStatusResponse> GetSetupStatusAsync();

        /// <summary>
        /// One-time admin registration. Fails if admin already exists.
        /// </summary>
        Task<(RegisterResponse? Data, string? Error)> RegisterAdminAsync(RegisterRequest request, string? ipAddress);

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

    // ─────────────────────────────────────────────
    // IMPLEMENTATION
    // ─────────────────────────────────────────────
    public class AuthService(
        AppDbContext db,
        IConfiguration config,
        IAuditService audit) : IAuthService
    {
        // ── SETUP STATUS ────────────────────────────────────────────────────────
        public async Task<SetupStatusResponse> GetSetupStatusAsync()
        {
            var adminRoleId = await GetRoleIdAsync("admin");

            var adminExists = await db.Users
                .AnyAsync(u => u.RoleId == adminRoleId && u.Active);

            var company = await db.Companies.FirstOrDefaultAsync();

            return new SetupStatusResponse(
                IsAdminRegistered: adminExists,
                IsCompanyConfigured: company is not null,
                CompanyName: company?.Name
            );
        }

        // ── ADMIN REGISTRATION (one-time) ────────────────────────────────────────
        public async Task<(RegisterResponse? Data, string? Error)> RegisterAdminAsync(
            RegisterRequest request, string? ipAddress)
        {
            var adminRoleId = await GetRoleIdAsync("admin");

            // Guard: only one admin ever
            var adminAlreadyExists = await db.Users
                .AnyAsync(u => u.RoleId == adminRoleId);

            if (adminAlreadyExists)
                return (null, "An administrator account already exists. Use the login page.");

            // Guard: email uniqueness
            if (await db.Users.AnyAsync(u => u.Email == request.Email))
                return (null, "This email address is already in use.");

            // Company must exist before admin is created (setup flow)
            var company = await db.Companies.FirstOrDefaultAsync();
            if (company is null)
                return (null, "Company profile not found. Complete company setup first.");

            var user = new User
            {
                CompanyId = company.Id,
                RoleId = adminRoleId,
                Email = request.Email.Trim().ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Phone = request.Phone?.Trim(),
                Active = true,
                CreatedAt = DateTime.UtcNow
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            await audit.LogAsync(
                userId: user.Id,
                entityType: "User",
                entityId: user.Id,
                action: "AdminRegistered",
                newValue: JsonSerializer.Serialize(new { user.Email, user.FirstName, user.LastName }),
                details: "First-time admin account created",
                ipAddress: ipAddress
            );

            return (new RegisterResponse(
                UserId: user.Id,
                Email: user.Email,
                FullName: $"{user.FirstName} {user.LastName}",
                Role: "admin",
                CreatedAt: user.CreatedAt
            ), null);
        }

        // ── EMPLOYEE REGISTRATION (admin only) ───────────────────────────────────
        public async Task<(RegisterResponse? Data, string? Error)> RegisterEmployeeAsync(
            CreateEmployeeRequest request, int adminUserId, string? ipAddress)
        {
            // Load subscription + plan to check seat limit
            var company = await db.Companies
                .Include(c => c.Subscription)
                    .ThenInclude(s => s!.Plan)
                .FirstOrDefaultAsync();

            if (company?.Subscription is null)
                return (null, "No active subscription found.");

            var plan = company.Subscription.Plan;

            // Count active users (admin + employees)
            var currentTotal = await db.Users
                .CountAsync(u => u.CompanyId == company.Id && u.Active);

            if (currentTotal >= plan.MaxTotalAccounts)
                return (null, $"Seat limit reached ({plan.MaxTotalAccounts} accounts on the {plan.Name} plan). Upgrade to add more users.");

            if (await db.Users.AnyAsync(u => u.Email == request.Email))
                return (null, "This email address is already in use.");

            var employeeRoleId = await GetRoleIdAsync("employee");

            var user = new User
            {
                CompanyId = company.Id,
                RoleId = employeeRoleId,
                Email = request.Email.Trim().ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Phone = request.Phone?.Trim(),
                Active = true,
                CreatedAt = DateTime.UtcNow
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            await audit.LogAsync(
                userId: adminUserId,
                entityType: "User",
                entityId: user.Id,
                action: "EmployeeCreated",
                newValue: JsonSerializer.Serialize(new { user.Email, user.FirstName, user.LastName }),
                details: $"Employee account created by admin (userId={adminUserId})",
                ipAddress: ipAddress
            );

            return (new RegisterResponse(
                UserId: user.Id,
                Email: user.Email,
                FullName: $"{user.FirstName} {user.LastName}",
                Role: "employee",
                CreatedAt: user.CreatedAt
            ), null);
        }

        // ── LOGIN ────────────────────────────────────────────────────────────────
        public async Task<(LoginResponse? Data, string? Error)> LoginAsync(
            LoginRequest request, string? ipAddress)
        {
            var user = await db.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email.Trim().ToLower());

            if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return (null, "Invalid email or password.");

            if (!user.Active)
                return (null, "This account has been deactivated. Contact your administrator.");

            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            await db.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            await audit.LogAsync(
                userId: user.Id,
                entityType: "User",
                entityId: user.Id,
                action: "Login",
                details: "Successful login",
                ipAddress: ipAddress
            );

            var expiry = DateTime.UtcNow.AddHours(GetTokenExpiryHours());

            return (new LoginResponse(
                UserId: user.Id,
                Email: user.Email,
                FirstName: user.FirstName,
                LastName: user.LastName,
                Role: user.Role.Name,
                Token: token,
                TokenExpiry: expiry
            ), null);
        }

        // ── CHANGE PASSWORD ───────────────────────────────────────────────────────
        public async Task<(bool Success, string? Error)> ChangePasswordAsync(
            int userId, ChangePasswordRequest request, string? ipAddress)
        {
            var user = await db.Users.FindAsync(userId);
            if (user is null) return (false, "User not found.");

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return (false, "Current password is incorrect.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await db.SaveChangesAsync();

            await audit.LogAsync(
                userId: userId,
                entityType: "User",
                entityId: userId,
                action: "PasswordChanged",
                details: "User changed their own password",
                ipAddress: ipAddress
            );

            return (true, null);
        }

        // ── GET USERS ────────────────────────────────────────────────────────────
        public async Task<UserListResponse> GetUsersAsync()
        {
            var company = await db.Companies
                .Include(c => c.Subscription)
                    .ThenInclude(s => s!.Plan)
                .FirstOrDefaultAsync();

            var maxAllowed = company?.Subscription?.Plan.MaxTotalAccounts ?? 0;

            var users = await db.Users
                .Include(u => u.Role)
                .OrderBy(u => u.CreatedAt)
                .Select(u => new UserDto(
                    u.Id,
                    u.Email,
                    u.FirstName,
                    u.LastName,
                    u.Phone,
                    u.Role.Name,
                    u.Active,
                    u.CreatedAt,
                    u.LastLoginAt
                ))
                .ToListAsync();

            return new UserListResponse(users, users.Count, maxAllowed);
        }

        // ── UPDATE USER ───────────────────────────────────────────────────────────
        public async Task<(UserDto? Data, string? Error)> UpdateUserAsync(
            int targetUserId, UpdateUserRequest request, int adminUserId, string? ipAddress)
        {
            var user = await db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == targetUserId);
            if (user is null) return (null, "User not found.");

            // Snapshot before
            var before = JsonSerializer.Serialize(new { user.FirstName, user.LastName, user.Phone, user.Active });

            user.FirstName = request.FirstName.Trim();
            user.LastName = request.LastName.Trim();
            user.Phone = request.Phone?.Trim();
            user.Active = request.Active;
            await db.SaveChangesAsync();

            var after = JsonSerializer.Serialize(new { user.FirstName, user.LastName, user.Phone, user.Active });

            await audit.LogAsync(
                userId: adminUserId,
                entityType: "User",
                entityId: targetUserId,
                action: "Updated",
                oldValue: before,
                newValue: after,
                ipAddress: ipAddress
            );

            return (new UserDto(
                user.Id, user.Email, user.FirstName, user.LastName,
                user.Phone, user.Role.Name, user.Active, user.CreatedAt, user.LastLoginAt
            ), null);
        }

        // ── DEACTIVATE USER ───────────────────────────────────────────────────────
        public async Task<(bool Success, string? Error)> DeactivateUserAsync(
            int targetUserId, int adminUserId, string? ipAddress)
        {
            // Prevent admin from deactivating themselves
            if (targetUserId == adminUserId)
                return (false, "You cannot deactivate your own account.");

            var user = await db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == targetUserId);
            if (user is null) return (false, "User not found.");

            if (user.Role.Name == "admin")
                return (false, "Admin account cannot be deactivated through this endpoint.");

            user.Active = false;
            await db.SaveChangesAsync();

            await audit.LogAsync(
                userId: adminUserId,
                entityType: "User",
                entityId: targetUserId,
                action: "Deactivated",
                details: $"Account deactivated by admin (userId={adminUserId}). Seat freed.",
                ipAddress: ipAddress
            );

            return (true, null);
        }

        // ── PRIVATE HELPERS ───────────────────────────────────────────────────────

        private string GenerateJwtToken(User user)
        {
            var jwtKey = config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured");
            var jwtIssuer = config["Jwt:Issuer"] ?? "FactuStock";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email,          user.Email),
            new Claim(ClaimTypes.Role,           user.Role.Name),
            new Claim(ClaimTypes.GivenName,      user.FirstName),
            new Claim(ClaimTypes.Surname,        user.LastName),
            new Claim("companyId",               user.CompanyId.ToString()),
            // JTI makes each token unique — useful for future token revocation
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtIssuer,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(GetTokenExpiryHours()),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private int GetTokenExpiryHours()
        {
            return int.TryParse(config["Jwt:ExpiryHours"], out var h) ? h : 8;
        }

        private async Task<int> GetRoleIdAsync(string roleName)
        {
            var role = await db.Roles.FirstOrDefaultAsync(r => r.Name == roleName)
                ?? throw new InvalidOperationException($"Role '{roleName}' not found in database. Run migrations and seed data.");
            return role.Id;
        }
    }
}
