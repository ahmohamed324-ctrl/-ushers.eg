using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UshersEg.Application.Common;
using UshersEg.Application.DTOs.Users;
using UshersEg.Application.Interfaces;

namespace UshersEg.API.Controllers;

[ApiController]
[Route("api/v1/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _users;

    public UsersController(IUserService users) => _users = users;

    private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetMe()
    {
        var profile = await _users.GetProfileAsync(UserId);
        if (profile is null) return NotFound(ApiResponse<UserProfileDto>.Fail("User not found."));
        return Ok(ApiResponse<UserProfileDto>.Ok(profile));
    }

    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> UpdateProfile(UpdateProfileDto dto)
    {
        var result = await _users.UpdateProfileAsync(UserId, dto);
        return Ok(ApiResponse<UserProfileDto>.Ok(result, "Profile updated."));
    }

    [HttpPut("usher-profile")]
    [Authorize(Roles = "Usher")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> UpdateUsherProfile(UpdateUsherProfileDto dto)
    {
        var result = await _users.UpdateUsherProfileAsync(UserId, dto);
        return Ok(ApiResponse<UserProfileDto>.Ok(result, "Usher profile updated."));
    }

    [HttpPost("upload-avatar")]
    public async Task<ActionResult<ApiResponse<string>>> UploadAvatar(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<string>.Fail("No file uploaded."));
        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(ApiResponse<string>.Fail("File size must be under 5MB."));

        using var stream = file.OpenReadStream();
        var url = await _users.UploadAvatarAsync(UserId, stream, file.FileName);
        return Ok(ApiResponse<string>.Ok(url, "Avatar uploaded."));
    }

    [HttpPost("upload-cv")]
    [Authorize(Roles = "Usher")]
    public async Task<ActionResult<ApiResponse<string>>> UploadCv(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<string>.Fail("No file uploaded."));
        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(ApiResponse<string>.Fail("File size must be under 10MB."));

        using var stream = file.OpenReadStream();
        var url = await _users.UploadCvAsync(UserId, stream, file.FileName);
        return Ok(ApiResponse<string>.Ok(url, "CV uploaded."));
    }

    [HttpPost("upload-formal-photo")]
    [Authorize(Roles = "Usher")]
    public async Task<ActionResult<ApiResponse<string>>> UploadFormalPhoto(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<string>.Fail("No file uploaded."));
        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(ApiResponse<string>.Fail("File size must be under 5MB."));

        using var stream = file.OpenReadStream();
        var url = await _users.UploadFormalPhotoAsync(UserId, stream, file.FileName);
        return Ok(ApiResponse<string>.Ok(url, "Formal photo uploaded."));
    }

    [HttpPost("upload-casual-photo")]
    [Authorize(Roles = "Usher")]
    public async Task<ActionResult<ApiResponse<string>>> UploadCasualPhoto(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<string>.Fail("No file uploaded."));
        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(ApiResponse<string>.Fail("File size must be under 5MB."));

        using var stream = file.OpenReadStream();
        var url = await _users.UploadCasualPhotoAsync(UserId, stream, file.FileName);
        return Ok(ApiResponse<string>.Ok(url, "Casual photo uploaded."));
    }
}
