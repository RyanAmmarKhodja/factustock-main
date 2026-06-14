using factustock.DTOs;
using factustock.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace factustock.Controllers
{
    [ApiController]
    [Route("api/bons")]
    [Authorize]
    public class BonController(IBonService bonService) : ControllerBase
    {
        // ── POST /api/bons ────────────────────────────────────────────────────────
        [HttpPost]
        public async Task<ActionResult<GenerateBonResponse>> GenerateBon(
            [FromBody] GenerateBonRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (data, error) = await bonService.GenerateBonAsync(request, GetUserId());

            if (error is not null)
                return error.Contains("introuvable") ? NotFound(new { message = error })
                                                     : BadRequest(new { message = error });
            return Ok(data);
        }

        // ── GET /api/bons/{id}/pdf ─────────────────────────────────────────────
        [HttpGet("{id:int}/pdf")]
        public async Task<IActionResult> DownloadBon(int id)
        {
            var (pdfBytes, fileName, error) = await bonService.DownloadBonAsync(id);

            if (error is not null)
                return error.Contains("introuvable") ? NotFound(new { message = error })
                                                     : BadRequest(new { message = error });

            return File(pdfBytes!, "application/pdf", fileName, enableRangeProcessing: true);
        }

        // ── GET /api/bons ─────────────────────────────────────────────────────────
        [HttpGet]
        public async Task<ActionResult<BonPagedResult>> GetBons(
            [FromQuery] string? search   = null,
            [FromQuery] string? type     = null,
            [FromQuery] int page         = 1,
            [FromQuery] int pageSize     = 20)
        {
            pageSize = Math.Clamp(pageSize, 1, 100);
            var result = await bonService.GetBonsAsync(search, type, page, pageSize);
            return Ok(result);
        }

        // ── GET /api/bons/{id} ────────────────────────────────────────────────────
        [HttpGet("{id:int}")]
        public async Task<ActionResult<BonDetailDto>> GetBon(int id)
        {
            var (data, error) = await bonService.GetBonAsync(id);

            if (error is not null) return NotFound(new { message = error });

            return Ok(data);
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new InvalidOperationException("UserId claim missing."));
    }
}
