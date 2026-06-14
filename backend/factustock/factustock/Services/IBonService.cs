using factustock.DTOs;

namespace factustock.Services
{
    public interface IBonService
    {
        Task<(GenerateBonResponse? Data, string? Error)> GenerateBonAsync(
            GenerateBonRequest request, int userId);

        Task<(byte[]? Pdf, string? FileName, string? Error)> DownloadBonAsync(int bonId);

        Task<BonPagedResult> GetBonsAsync(
            string? search, string? type, int page, int pageSize);

        Task<(BonDetailDto? Data, string? Error)> GetBonAsync(int bonId);
    }
}
