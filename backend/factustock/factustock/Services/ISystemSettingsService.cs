using factustock.DTOs;

namespace factustock.Services
{
    public interface ISystemSettingsService
    {
        Task<SetupStatusResponse> GetSetupStatusAsync();
        Task<(bool Success, string? Error)> CompleteSetupAsync(SetupStatusResponse request);
    }
}
