using factustock.Data;
using factustock.DTOs;
using Microsoft.EntityFrameworkCore;

namespace factustock.Services
{
    public class SystemSettingsService : ISystemSettingsService
    {
        private readonly AppDbContext _context;
        public SystemSettingsService(AppDbContext context) {
            _context = context;
        }

        public async Task<SetupStatusResponse> GetSetupStatusAsync()
        {
            var settings = _context.SystemSettings.First();

            return (new SetupStatusResponse(
                settings.SetupCompleted,
                settings.Version,
                settings.LicenseKey,

                settings.InstalledAt
                ));
        }

        public async Task<(bool Success, string? Error)> CompleteSetupAsync(SetupStatusResponse request)
        {
            var settings = _context.SystemSettings.First();
            if (settings.SetupCompleted)
                return (false, "Setup has already been completed.");
            // Additional validation can be added here (e.g. validate license key format)
            settings.SetupCompleted = true;
            //settings.Version = request.Version;
            //settings.LicenseKey = request.LicenseKey;
            settings.InstalledAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return (true, null);
        }

    }
}
