using Microsoft.AspNetCore.SignalR;

namespace SiloBackend.Hubs;

public class SiloHub : Hub
{
    private readonly ILogger<SiloHub> _logger;

    public SiloHub(ILogger<SiloHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}
