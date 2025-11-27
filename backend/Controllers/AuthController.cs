using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SiloBackend.Models;
using SiloBackend.Services;

namespace SiloBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Kullanıcı adı ve şifre gereklidir" });
        }

        var response = await _authService.LoginAsync(request.Username, request.Password);

        if (response == null)
        {
            return Unauthorized(new { message = "Kullanıcı adı veya şifre hatalı" });
        }

        return Ok(response);
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        // In JWT-based auth, logout is typically handled client-side by removing the token
        // This endpoint exists for consistency and can be extended for token blacklisting if needed
        return Ok(new { message = "Başarıyla çıkış yapıldı" });
    }

    [HttpGet("validate")]
    [Authorize]
    public IActionResult ValidateToken()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var fullName = User.FindFirst("FullName")?.Value;

        return Ok(new
        {
            userId,
            username,
            role,
            fullName,
            isAuthenticated = true
        });
    }
}
