namespace SiloBackend.Services;

public interface ISiloDataSource
{
    Task<double> GetCurrentLevelAsync(CancellationToken ct = default);
    Task<double> GetCurrentTemperatureAsync(CancellationToken ct = default);
}
