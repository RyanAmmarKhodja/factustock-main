using factustock.DTOs;
using factustock.Services;
using factustock.DTOs;
using factustock.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace factustock.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    

    // ── POST /api/auth/register/admin ────────────────────────────────────────
    /// <summary>
    /// One-time admin setup. Public endpoint but server-enforces single admin.
    /// After this succeeds, this endpoint will always return 409 Conflict.
    /// </summary>
    [HttpPost("register/admin")]
    [AllowAnonymous]
    public async Task<ActionResult<RegisterResponse>> RegisterAdmin([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var ip = GetClientIp();
        var (data, error) = await authService.RegisterAdminAsync(request, ip);

        if (error is not null)
            return Conflict(new { message = error });

        return CreatedAtAction(nameof(RegisterAdmin), data);
    }


    [HttpPost("register/company")]
    [AllowAnonymous]
    public async Task<ActionResult<CompanyDto>> RegisterCompany([FromBody] CompanyDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (data, error) = await authService.RegisterCompanyAsync(request);

        if (error is not null)
            return Conflict(new { message = error });

        return CreatedAtAction(nameof(RegisterAdmin), data);
    }

    // ── POST /api/auth/register/employee ─────────────────────────────────────
    /// <summary>
    /// Admin creates employee accounts. Protected — admin JWT required.
    /// Enforces plan seat limit.
    /// </summary>
    [HttpPost("register/employee")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<RegisterResponse>> RegisterEmployee([FromBody] CreateEmployeeRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var adminId = GetCurrentUserId();
        var ip = GetClientIp();

        var (data, error) = await authService.RegisterEmployeeAsync(request, adminId, ip);

        if (error is not null)
            return error.Contains("Seat limit") ? StatusCode(403, new { message = error })
                                                : BadRequest(new { message = error });

        return CreatedAtAction(nameof(RegisterEmployee), data);
    }

    // ── POST /api/auth/login ─────────────────────────────────────────────────
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var ip = GetClientIp();
        var (data, error) = await authService.LoginAsync(request, ip);

        if (error is not null)
            return Unauthorized(new { message = error });

        return Ok(data);
    }

    // ── POST /api/auth/change-password ───────────────────────────────────────
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        var ip = GetClientIp();

        var (success, error) = await authService.ChangePasswordAsync(userId, request, ip);

        if (!success)
            return BadRequest(new { message = error });

        return Ok(new { message = "Password changed successfully." });
    }

    // ── GET /api/auth/users ───────────────────────────────────────────────────
    /// <summary>
    /// Admin views all users + seat usage vs plan limit.
    /// </summary>
    [HttpGet("users")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<UserListResponse>> GetUsers()
    {
        var result = await authService.GetUsersAsync();
        return Ok(result);
    }

    // ── PUT /api/auth/users/{id} ──────────────────────────────────────────────
    [HttpPut("users/{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<UserDto>> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var adminId = GetCurrentUserId();
        var ip = GetClientIp();

        var (data, error) = await authService.UpdateUserAsync(id, request, adminId, ip);

        if (error is not null)
            return NotFound(new { message = error });

        return Ok(data);
    }

    // ── DELETE /api/auth/users/{id}/deactivate ────────────────────────────────
    [HttpDelete("users/{id:int}/deactivate")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeactivateUser(int id)
    {
        var adminId = GetCurrentUserId();
        var ip = GetClientIp();

        var (success, error) = await authService.DeactivateUserAsync(id, adminId, ip);

        if (!success)
            return BadRequest(new { message = error });

        return Ok(new { message = "User deactivated. Seat is now available." });
    }

    [HttpGet("test")]
    public async Task<IActionResult> Test()
    {
        var userId = GetCurrentUserId();
        var ip = GetClientIp();
        return Ok("test");
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────
    private int GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("UserId claim missing from token.");
        return int.Parse(claim);
    }

    private string? GetClientIp()
    {
        // Works for both direct connections and behind a reverse proxy
        return HttpContext.Connection.RemoteIpAddress?.ToString()
            ?? HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
    }
}