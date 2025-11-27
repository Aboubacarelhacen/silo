using Microsoft.AspNetCore.Mvc;
using SiloBackend.Services;

namespace SiloBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SiloController : ControllerBase
{
    private readonly SiloMonitorService _monitorService;
    private readonly ILogger<SiloController> _logger;

    public SiloController(
        SiloMonitorService monitorService,
        ILogger<SiloController> logger)
    {
        _monitorService = monitorService;
        _logger = logger;
    }

    [HttpGet("current")]
    public IActionResult GetCurrent()
    {
        var level = _monitorService.GetLastLevel();
        var status = level > 40 ? "Normal" : level >= 20 ? "Low" : "Critical";

        return Ok(new
        {
            levelPercent = level,
            status
        });
    }

    [HttpGet("history")]
    public IActionResult GetHistory([FromQuery] int maxCount = 200)
    {
        var history = _monitorService.GetRecentHistory(maxCount);
        return Ok(history);
    }
}
