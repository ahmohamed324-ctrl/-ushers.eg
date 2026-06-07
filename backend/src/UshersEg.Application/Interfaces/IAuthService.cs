using UshersEg.Application.DTOs.Auth;

namespace UshersEg.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task ForgotPasswordAsync(string email);
    Task ResetPasswordAsync(ResetPasswordDto dto);
    Task VerifyEmailAsync(string token);
    Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
    Task RevokeTokenAsync(Guid userId);
}
