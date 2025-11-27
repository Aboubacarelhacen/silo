namespace SiloBackend.Models;

public class SiloLevelSample
{
    public DateTime Timestamp { get; set; }
    public double LevelPercent { get; set; }
}

public class TemperatureSample
{
    public DateTime Timestamp { get; set; }
    public double TemperatureC { get; set; }
}

public enum AlarmSeverity
{
    Info,
    Warning,
    Critical
}

public class AlarmEvent
{
    public Guid Id { get; set; }
    public DateTime Timestamp { get; set; }
    public AlarmSeverity Severity { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool Acknowledged { get; set; }
}

public enum UserRole
{
    Admin,
    Operator
}

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class CreateUserRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class UpdateUserRequest
{
    public string? FullName { get; set; }
    public string? Password { get; set; }
    public bool? IsActive { get; set; }
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}
