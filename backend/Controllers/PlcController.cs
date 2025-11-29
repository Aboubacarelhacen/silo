using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SiloBackend.Services;

namespace SiloBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class PlcController : ControllerBase
{
    private readonly ISiloDataSource _dataSource;
    private readonly ILogger<PlcController> _logger;

    public PlcController(ISiloDataSource dataSource, ILogger<PlcController> logger)
    {
        _dataSource = dataSource;
        _logger = logger;
    }

    [HttpPost("connect")]
    public async Task<IActionResult> Connect()
    {
        try
        {
            if (_dataSource is RealOpcUaSiloDataSource opcSource)
            {
                await opcSource.ConnectAsync();
                return Ok(new { success = true, message = "PLC'ye bağlandı" });
            }
            return BadRequest(new { success = false, message = "OPC UA veri kaynağı bulunamadı" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PLC bağlantısı başarısız");
            return StatusCode(500, new { success = false, message = $"Bağlantı hatası: {ex.Message}" });
        }
    }

    [HttpPost("disconnect")]
    public IActionResult Disconnect()
    {
        try
        {
            if (_dataSource is RealOpcUaSiloDataSource opcSource)
            {
                opcSource.Disconnect();
                return Ok(new { success = true, message = "PLC bağlantısı kesildi" });
            }
            return BadRequest(new { success = false, message = "OPC UA veri kaynağı bulunamadı" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PLC bağlantısı kesme hatası");
            return StatusCode(500, new { success = false, message = $"Hata: {ex.Message}" });
        }
    }

    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        try
        {
            if (_dataSource is RealOpcUaSiloDataSource opcSource)
            {
                var status = opcSource.GetConnectionStatus();
                return Ok(new
                {
                    connected = status.IsConnected,
                    message = status.Message,
                    lastError = status.LastError,
                    endpoint = status.EndpointUrl
                });
            }
            return BadRequest(new { connected = false, message = "OPC UA veri kaynağı bulunamadı" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Durum kontrolü hatası");
            return StatusCode(500, new { connected = false, message = $"Hata: {ex.Message}" });
        }
    }
}
