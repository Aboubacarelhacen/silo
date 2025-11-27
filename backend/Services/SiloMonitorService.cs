using Microsoft.AspNetCore.SignalR;
using SiloBackend.Models;
using SiloBackend.Hubs;

namespace SiloBackend.Services;

public class SiloMonitorService : BackgroundService
{
    private readonly ISiloDataSource _dataSource;
    private readonly IHubContext<SiloHub> _hubContext;
    private readonly ILogger<SiloMonitorService> _logger;

    private double _lastLevel;
    private readonly List<SiloLevelSample> _history = new();
    private readonly object _lock = new();

    private double _lastTemperature;
    private readonly List<TemperatureSample> _temperatureHistory = new();
    private readonly object _temperatureLock = new();

    public SiloMonitorService(
        ISiloDataSource dataSource,
        IHubContext<SiloHub> hubContext,
        ILogger<SiloMonitorService> logger)
    {
        _dataSource = dataSource;
        _hubContext = hubContext;
        _logger = logger;
    }

    public double GetLastLevel()
    {
        lock (_lock)
        {
            return _lastLevel;
        }
    }

    public IReadOnlyList<SiloLevelSample> GetRecentHistory(int maxCount = 200)
    {
        lock (_lock)
        {
            return _history.TakeLast(maxCount).ToList();
        }
    }

    public double GetLastTemperature()
    {
        lock (_temperatureLock)
        {
            return _lastTemperature;
        }
    }

    public IReadOnlyList<TemperatureSample> GetRecentTemperatureHistory(int maxCount = 200)
    {
        lock (_temperatureLock)
        {
            return _temperatureHistory.TakeLast(maxCount).ToList();
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SiloMonitorService starting");

        // Wait a bit for the application to fully start
        await Task.Delay(2000, stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var level = await _dataSource.GetCurrentLevelAsync(stoppingToken);

                lock (_lock)
                {
                    _lastLevel = level;

                    var sample = new SiloLevelSample
                    {
                        Timestamp = DateTime.UtcNow,
                        LevelPercent = level
                    };

                    _history.Add(sample);

                    // Keep history size manageable
                    if (_history.Count > 1000)
                    {
                        _history.RemoveRange(0, _history.Count - 1000);
                    }
                }

                // Derive status
                var status = level > 40 ? "Normal" : level >= 20 ? "Low" : "Critical";

                // Broadcast to all connected clients
                await _hubContext.Clients.All.SendAsync(
                    "SiloLevelUpdated",
                    new
                    {
                        levelPercent = level,
                        status,
                        timestamp = DateTime.UtcNow
                    },
                    stoppingToken);

                _logger.LogDebug("Broadcasted level: {Level}%, status: {Status}", level, status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in silo monitoring loop");
            }

            // Temperature monitoring
            try
            {
                var temp = await _dataSource.GetCurrentTemperatureAsync(stoppingToken);

                lock (_temperatureLock)
                {
                    _lastTemperature = temp;

                    var sample = new TemperatureSample
                    {
                        Timestamp = DateTime.UtcNow,
                        TemperatureC = temp
                    };

                    _temperatureHistory.Add(sample);

                    if (_temperatureHistory.Count > 1000)
                    {
                        _temperatureHistory.RemoveRange(0, _temperatureHistory.Count - 1000);
                    }
                }

                // Determine temperature status
                var tempStatus = temp < 40 ? "Cool" : temp <= 80 ? "Normal" : "High";

                // Broadcast temperature update
                await _hubContext.Clients.All.SendAsync(
                    "TemperatureUpdated",
                    new
                    {
                        temperatureC = temp,
                        status = tempStatus,
                        timestamp = DateTime.UtcNow
                    },
                    stoppingToken);

                _logger.LogDebug("Broadcasted temperature: {Temp}°C, status: {Status}", temp, tempStatus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in temperature monitoring loop");
            }

            await Task.Delay(1000, stoppingToken);
        }

        _logger.LogInformation("SiloMonitorService stopping");
    }
}
