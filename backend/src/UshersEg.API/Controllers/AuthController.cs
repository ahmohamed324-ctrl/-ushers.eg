using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UshersEg.Application.Common;
using UshersEg.Application.DTOs.Auth;
using UshersEg.Application.Interfaces;

using Microsoft.EntityFrameworkCore;
using UshersEg.Domain.Entities;
using UshersEg.Domain.Enums;
using UshersEg.Infrastructure.Data;

namespace UshersEg.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly ApplicationDbContext _db;

    public AuthController(IAuthService auth, ApplicationDbContext db)
    {
        _auth = auth;
        _db = db;
    }

    [HttpGet("setup-admin")]
    public async Task<ActionResult<ApiResponse<string>>> SetupAdmin()
    {
        var existingAdmin = await _db.Users.FirstOrDefaultAsync(u => u.Email == "ushers.recruting@gmail.com");
        if (existingAdmin == null)
        {
            var superAdmin = new User
            {
                Id = Guid.NewGuid(),
                Email = "ushers.recruting@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Hti@2026"),
                FirstName = "Ushers",
                LastName = "Admin",
                Role = UserRole.Admin,
                IsVerified = true,
                IsActive = true,
                PreferredLanguage = "en"
            };
            await _db.Users.AddAsync(superAdmin);
            await _db.SaveChangesAsync();
            return Ok(ApiResponse<string>.Ok("Admin user created."));
        }
        else
        {
            // Force update password and role
            existingAdmin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Hti@2026");
            existingAdmin.Role = UserRole.Admin;
            existingAdmin.IsVerified = true;
            existingAdmin.IsActive = true;
            await _db.SaveChangesAsync();
            return Ok(ApiResponse<string>.Ok("Admin user updated with new password and role."));
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register(RegisterDto dto)
    {
        try
        {
            var result = await _auth.RegisterAsync(dto);
            return Ok(ApiResponse<AuthResponseDto>.Ok(result, "Registration successful!"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<AuthResponseDto>.Fail(ex.Message));
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login(LoginDto dto)
    {
        try
        {
            var result = await _auth.LoginAsync(dto);
            return Ok(ApiResponse<AuthResponseDto>.Ok(result, "Login successful!"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<AuthResponseDto>.Fail(ex.Message));
        }
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Refresh(RefreshTokenDto dto)
    {
        try
        {
            var result = await _auth.RefreshTokenAsync(dto.RefreshToken);
            return Ok(ApiResponse<AuthResponseDto>.Ok(result));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<AuthResponseDto>.Fail(ex.Message));
        }
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<ApiResponse>> ForgotPassword(ForgotPasswordDto dto)
    {
        await _auth.ForgotPasswordAsync(dto.Email);
        return Ok(ApiResponse.Ok("If that email exists, a reset link has been sent."));
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<ApiResponse>> ResetPassword(ResetPasswordDto dto)
    {
        try
        {
            await _auth.ResetPasswordAsync(dto);
            return Ok(ApiResponse.Ok("Password reset successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
    }

    [HttpGet("verify-email")]
    public async Task<ActionResult<ApiResponse>> VerifyEmail([FromQuery] string token)
    {
        try
        {
            await _auth.VerifyEmailAsync(token);
            return Ok(ApiResponse.Ok("Email verified successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult<ApiResponse>> ChangePassword(ChangePasswordDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        try
        {
            await _auth.ChangePasswordAsync(userId, dto);
            return Ok(ApiResponse.Ok("Password changed successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult<ApiResponse>> Logout()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        await _auth.RevokeTokenAsync(userId);
        return Ok(ApiResponse.Ok("Logged out successfully."));
    }
}
