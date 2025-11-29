namespace SiloBackend.Services;

public interface ISiloDataSource
{
    Task<double> GetCurrentLevelAsync(CancellationToken ct = default);
    Task<double> GetCurrentTemperatureAsync(CancellationToken ct = default);
}

public record ConnectionStatus(
    bool IsConnected,
    string Message,
    string? LastError,
    string EndpointUrl
);
