using factustock.Data;
using factustock.DTOs;
using factustock.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace factustock.Controllers
{
    [ApiController]
    [Route("api/system")]
    public class SystemController(ISystemSettingsService systemService, AppDbContext context) : Controller
    {
        private const int CompanyId = 1;

        // ── GET /api/system/setup-status ─────────────────────────────────────
        [HttpGet("setup-status")]
        [AllowAnonymous]
        public async Task<ActionResult<SetupStatusResponse>> GetSetupStatus()
        {
            var status = await systemService.GetSetupStatusAsync();
            return Ok(status);
        }

        // ── PUT /api/system/complete-setup ────────────────────────────────────
        [HttpPut("complete-setup")]
        [AllowAnonymous]
        public async Task<ActionResult<SetupStatusResponse>> CompleteSetupAsync(SetupStatusResponse request)
        {
            var status = await systemService.CompleteSetupAsync(request);
            return Ok(status);
        }

        // ── GET /api/system/company ───────────────────────────────────────────
        [HttpGet("company")]
        [Authorize]
        public async Task<ActionResult<CompanyDto>> GetCompany()
        {
            var company = await context.Company.FindAsync(CompanyId);
            if (company is null) return NotFound(new { message = "Données de l'entreprise introuvables." });

            return Ok(new CompanyDto(
                company.Id, company.Name, company.LegalName,
                company.Email, company.Tel, company.Adresse,
                company.RC, company.AI, company.NIF, company.NIS,
                company.N_BL, company.N_BP,
                null,   // N_Facture — not in Company model
                company.LogoUrl, company.Website
            ));
        }

        // ── PUT /api/system/company ───────────────────────────────────────────
        [HttpPut("company")]
        [Authorize]
        public async Task<ActionResult<CompanyDto>> UpdateCompany([FromBody] UpdateCompanyRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var company = await context.Company.FindAsync(CompanyId);
            if (company is null) return NotFound(new { message = "Données de l'entreprise introuvables." });

            company.Name      = request.Name.Trim();
            company.LegalName = request.LegalName?.Trim();
            company.Email     = request.Email?.Trim();
            company.Tel       = request.Tel?.Trim();
            company.Adresse   = request.Adresse?.Trim();
            company.RC        = request.RC?.Trim();
            company.AI        = request.AI?.Trim();
            company.NIF       = request.NIF?.Trim();
            company.NIS       = request.NIS?.Trim();
            company.N_BL      = request.N_BL?.Trim();
            company.N_BP      = request.N_BP?.Trim();
            company.Website   = request.Website?.Trim();

            await context.SaveChangesAsync();

            return Ok(new CompanyDto(
                company.Id, company.Name, company.LegalName,
                company.Email, company.Tel, company.Adresse,
                company.RC, company.AI, company.NIF, company.NIS,
                company.N_BL, company.N_BP, null, company.LogoUrl, company.Website
            ));
        }
    }
}
