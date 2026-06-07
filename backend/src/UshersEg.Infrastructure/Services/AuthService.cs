using Microsoft.EntityFrameworkCore;
using UshersEg.Application.DTOs.Auth;
using UshersEg.Application.Interfaces;
using UshersEg.Domain.Entities;
using UshersEg.Domain.Enums;
using UshersEg.Infrastructure.Data;

namespace UshersEg.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _db;
    private readonly IJwtService _jwt;
    private readonly IEmailService _email;

    public AuthService(ApplicationDbContext db, IJwtService jwt, IEmailService email)
    {
        _db = db;
        _jwt = jwt;
        _email = email;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(x => x.Email == dto.Email.ToLower()))
            throw new InvalidOperationException("Email already registered.");

        var role = Enum.TryParse<UserRole>(dto.Role, true, out var parsedRole) ? parsedRole : UserRole.Usher;
        var verificationToken = Guid.NewGuid().ToString("N");

        var user = new User
        {
            Email = dto.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Role = role,
            Phone = dto.Phone,
            Gender = dto.Gender,
            EmailVerificationToken = verificationToken,
            EmailVerificationTokenExpiry = DateTime.UtcNow.AddDays(1),
            IsVerified = true // Auto-verify for demo; set to false in production
        };

        _db.Users.Add(user);

        // Create default profile
        if (role == UserRole.Usher)
            _db.UsherProfiles.Add(new UsherProfile { UserId = user.Id });

        // Create free subscription
        _db.Subscriptions.Add(new Subscription { UserId = user.Id, Plan = "free" });

        await _db.SaveChangesAsync();
        await _email.SendWelcomeEmailAsync(user.Email, user.FirstName, role.ToString());

        return await GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users
            .Include(x => x.UsherProfile)
            .FirstOrDefaultAsync(x => x.Email == dto.Email.ToLower() && !x.IsDeleted);

        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated. Please contact support.");

        return await GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(x => x.RefreshToken == refreshToken && !x.IsDeleted);

        if (user is null || user.RefreshTokenExpiry < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");

        return await GenerateAuthResponse(user);
    }

    public async Task ForgotPasswordAsync(string email)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x => x.Email == email.ToLower());
        if (user is null) return; // Don't reveal if email exists

        user.PasswordResetToken = Guid.NewGuid().ToString("N");
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(2);
        await _db.SaveChangesAsync();

        await _email.SendPasswordResetAsync(user.Email, user.FirstName, user.PasswordResetToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x =>
            x.PasswordResetToken == dto.Token &&
            x.PasswordResetTokenExpiry > DateTime.UtcNow);

        if (user is null)
            throw new InvalidOperationException("Invalid or expired reset token.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;
        user.RefreshToken = null;
        await _db.SaveChangesAsync();
    }

    public async Task VerifyEmailAsync(string token)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x =>
            x.EmailVerificationToken == token &&
            x.EmailVerificationTokenExpiry > DateTime.UtcNow);

        if (user is null)
            throw new InvalidOperationException("Invalid or expired verification token.");

        user.IsVerified = true;
        user.EmailVerificationToken = null;
        user.EmailVerificationTokenExpiry = null;
        await _db.SaveChangesAsync();
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new InvalidOperationException("Current password is incorrect.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _db.SaveChangesAsync();
    }

    public async Task RevokeTokenAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is not null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            await _db.SaveChangesAsync();
        }
    }

    private async Task<AuthResponseDto> GenerateAuthResponse(User user)
    {
        var accessToken = _jwt.GenerateAccessToken(user);
        var refreshToken = _jwt.GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddMinutes(60);

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(30);
        await _db.SaveChangesAsync();

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            User = new UserAuthDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                AvatarUrl = user.AvatarUrl,
                IsVerified = user.IsVerified,
                PreferredLanguage = user.PreferredLanguage
            }
        };
    }
}
