using Microsoft.AspNetCore.Mvc;
using SiloBackend.Services;

namespace SiloBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TemperatureController : ControllerBase
{
    private readonly SiloMonitorService _monitorService;
    private readonly ILogger<TemperatureController> _logger;

    public TemperatureController(
        SiloMonitorService monitorService,
        ILogger<TemperatureController> logger)
    {
        _monitorService = monitorService;
        _logger = logger;
    }

    [HttpGet("current")]
    public IActionResult GetCurrent()
    {
        var temp = _monitorService.GetLastTemperature();
        var status = temp < 40 ? "Cool" : temp <= 80 ? "Normal" : "High";

        return Ok(new
        {
            temperatureC = temp,
            status
        });
    }

    [HttpGet("history")]
    public IActionResult GetHistory([FromQuery] int maxCount = 200)
    {
        var history = _monitorService.GetRecentTemperatureHistory(maxCount);
        return Ok(history);
    }
}
