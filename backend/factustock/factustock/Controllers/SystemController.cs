using factustock.DTOs;
using factustock.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace factustock.Controllers
{
    [ApiController]
    [Route("api/system")]
    public class SystemController(ISystemSettingsService systemService) : Controller
    {

        [HttpGet("setup-status")]
        [AllowAnonymous]
        public async Task<ActionResult<SetupStatusResponse>> GetSetupStatus()
        {
            var status = await systemService.GetSetupStatusAsync();
            return Ok(status);
        }

        [HttpPut("complete-setup")]
        [AllowAnonymous]
        public async Task<ActionResult<SetupStatusResponse>> CompleteSetupAsync(SetupStatusResponse request)
        {
            var status = await systemService.CompleteSetupAsync(request);
            return Ok(status);
        }
    }
}
