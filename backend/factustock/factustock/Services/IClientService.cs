using factustock.DTOs;

namespace factustock.Services
{
    public interface IClientService
    {
        Task<(ClientDto? Data, string? Error)> CreateClientAsync(CreateClientRequest request, int userId);
        Task<(ClientDto? Data, string? Error)> UpdateClientAsync(int clientId, UpdateClientRequest request, int userId);
        Task<(bool Success, string? Error)> ArchiveClientAsync(int clientId, int userId);
        Task<(bool Success, string? Error)> RestoreClientAsync(int clientId, int userId);
        Task<(ClientDto? Data, string? Error)> GetClientAsync(int clientId);
        Task<ClientPagedResult> GetAllClientsAsync(ClientQueryRequest query);
        Task<(ClientStatsDto? Data, string? Error)> GetClientStatsAsync(int clientId);
        Task<(List<ClientInvoiceRowDto>? Data, string? Error)> GetClientInvoicesAsync(int clientId);
    }
}
