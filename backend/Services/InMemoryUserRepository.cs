using SiloBackend.Models;
using System.Collections.Concurrent;

namespace SiloBackend.Services;

/// <summary>
/// In-memory user repository for demonstration.
/// In production, replace this with a database implementation.
/// </summary>
public class InMemoryUserRepository : IUserRepository
{
    private readonly ConcurrentDictionary<Guid, User> _users = new();
    private readonly ILogger<InMemoryUserRepository> _logger;

    public InMemoryUserRepository(ILogger<InMemoryUserRepository> logger)
    {
        _logger = logger;
        SeedDefaultAdmin();
    }

    private void SeedDefaultAdmin()
    {
        // Create default admin user with password "admin123"
        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            FullName = "System Administrator",
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _users.TryAdd(adminUser.Id, adminUser);
        _logger.LogInformation("Default admin user created. Username: admin, Password: admin123");
    }

    public Task<User?> GetByUsernameAsync(string username)
    {
        var user = _users.Values.FirstOrDefault(u =>
            u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(user);
    }

    public Task<User?> GetByIdAsync(Guid id)
    {
        _users.TryGetValue(id, out var user);
        return Task.FromResult(user);
    }

    public Task<List<User>> GetAllAsync()
    {
        return Task.FromResult(_users.Values.OrderBy(u => u.Username).ToList());
    }

    public Task<User> CreateAsync(User user)
    {
        user.Id = Guid.NewGuid();
        user.CreatedAt = DateTime.UtcNow;
        _users.TryAdd(user.Id, user);
        _logger.LogInformation("User created: {Username} (Role: {Role})", user.Username, user.Role);
        return Task.FromResult(user);
    }

    public Task<User?> UpdateAsync(Guid id, User user)
    {
        if (_users.TryGetValue(id, out var existingUser))
        {
            user.Id = id;
            user.CreatedAt = existingUser.CreatedAt;
            _users[id] = user;
            _logger.LogInformation("User updated: {Username}", user.Username);
            return Task.FromResult<User?>(user);
        }
        return Task.FromResult<User?>(null);
    }

    public Task<bool> DeleteAsync(Guid id)
    {
        var removed = _users.TryRemove(id, out var user);
        if (removed && user != null)
        {
            _logger.LogInformation("User deleted: {Username}", user.Username);
        }
        return Task.FromResult(removed);
    }

    public Task<bool> UsernameExistsAsync(string username)
    {
        var exists = _users.Values.Any(u =>
            u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(exists);
    }
}
