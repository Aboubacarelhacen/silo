using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SiloBackend.Models;
using SiloBackend.Services;
using System.Security.Claims;

namespace SiloBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserRepository userRepository, ILogger<UsersController> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userRepository.GetAllAsync();
        var userDtos = users.Select(u => new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            FullName = u.FullName,
            Role = u.Role.ToString(),
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt,
            LastLoginAt = u.LastLoginAt
        }).ToList();

        return Ok(userDtos);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUser(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "Kullanıcı bulunamadı" });
        }

        var userDto = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };

        return Ok(userDto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.FullName))
        {
            return BadRequest(new { message = "Tüm alanlar gereklidir" });
        }

        if (request.Password.Length < 6)
        {
            return BadRequest(new { message = "Şifre en az 6 karakter olmalıdır" });
        }

        // Check if username already exists
        if (await _userRepository.UsernameExistsAsync(request.Username))
        {
            return Conflict(new { message = "Bu kullanıcı adı zaten kullanılıyor" });
        }

        // Parse role
        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
        {
            return BadRequest(new { message = "Geçersiz rol" });
        }

        // Create user
        var user = new User
        {
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            Role = role,
            IsActive = true
        };

        var createdUser = await _userRepository.CreateAsync(user);

        var userDto = new UserDto
        {
            Id = createdUser.Id,
            Username = createdUser.Username,
            FullName = createdUser.FullName,
            Role = createdUser.Role.ToString(),
            IsActive = createdUser.IsActive,
            CreatedAt = createdUser.CreatedAt,
            LastLoginAt = createdUser.LastLoginAt
        };

        return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, userDto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "Kullanıcı bulunamadı" });
        }

        // Update fields if provided
        if (!string.IsNullOrWhiteSpace(request.FullName))
        {
            user.FullName = request.FullName;
        }

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            if (request.Password.Length < 6)
            {
                return BadRequest(new { message = "Şifre en az 6 karakter olmalıdır" });
            }
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }

        if (request.IsActive.HasValue)
        {
            user.IsActive = request.IsActive.Value;
        }

        var updatedUser = await _userRepository.UpdateAsync(id, user);
        if (updatedUser == null)
        {
            return StatusCode(500, new { message = "Kullanıcı güncellenemedi" });
        }

        var userDto = new UserDto
        {
            Id = updatedUser.Id,
            Username = updatedUser.Username,
            FullName = updatedUser.FullName,
            Role = updatedUser.Role.ToString(),
            IsActive = updatedUser.IsActive,
            CreatedAt = updatedUser.CreatedAt,
            LastLoginAt = updatedUser.LastLoginAt
        };

        return Ok(userDto);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId == id.ToString())
        {
            return BadRequest(new { message = "Kendi hesabınızı silemezsiniz" });
        }

        var deleted = await _userRepository.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = "Kullanıcı bulunamadı" });
        }

        return Ok(new { message = "Kullanıcı başarıyla silindi" });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
        {
            return Unauthorized();
        }

        var user = await _userRepository.GetByIdAsync(userGuid);
        if (user == null)
        {
            return NotFound(new { message = "Kullanıcı bulunamadı" });
        }

        var userDto = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };

        return Ok(userDto);
    }
}
