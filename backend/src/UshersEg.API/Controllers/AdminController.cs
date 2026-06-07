using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UshersEg.Application.Common;
using UshersEg.Application.DTOs.Admin;
using UshersEg.Application.DTOs.Jobs;
using UshersEg.Application.Interfaces;

namespace UshersEg.API.Controllers;

[ApiController]
[Route("api/v1/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _admin;

    public AdminController(IAdminService admin) => _admin = admin;

    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiResponse<AdminDashboardDto>>> GetDashboard()
    {
        var result = await _admin.GetDashboardAsync();
        return Ok(ApiResponse<AdminDashboardDto>.Ok(result));
    }

    [HttpGet("users")]
    public async Task<ActionResult<ApiResponse<PagedResult<AdminUserDto>>>> GetUsers([FromQuery] string? search, [FromQuery] string? role, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _admin.GetUsersAsync(search, role, page, pageSize);
        return Ok(ApiResponse<PagedResult<AdminUserDto>>.Ok(result));
    }

    [HttpPatch("users/{id:guid}/toggle-active")]
    public async Task<ActionResult<ApiResponse<bool>>> ToggleUserActive(Guid id)
    {
        var result = await _admin.ToggleUserActiveAsync(id);
        return Ok(ApiResponse<bool>.Ok(result));
    }

    [HttpGet("users/{id:guid}/profile")]
    public async Task<ActionResult<ApiResponse<UshersEg.Application.DTOs.Users.UserProfileDto>>> GetUserProfile(Guid id)
    {
        var result = await _admin.GetUserProfileAsync(id);
        return Ok(ApiResponse<UshersEg.Application.DTOs.Users.UserProfileDto>.Ok(result));
    }

    [HttpDelete("users/{id:guid}")]
    public async Task<ActionResult<ApiResponse>> DeleteUser(Guid id)
    {
        await _admin.DeleteUserAsync(id);
        return Ok(ApiResponse.Ok("User deleted."));
    }

    [HttpGet("jobs")]
    public async Task<ActionResult<ApiResponse<PagedResult<object>>>> GetJobs([FromQuery] string? search, [FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _admin.GetJobsAsync(search, status, page, pageSize);
        return Ok(ApiResponse<PagedResult<object>>.Ok(result));
    }

    [HttpPatch("jobs/{id:guid}/moderate")]
    public async Task<ActionResult<ApiResponse>> ModerateJob(Guid id, ModerateJobDto dto)
    {
        await _admin.ModerateJobAsync(id, dto);
        return Ok(ApiResponse.Ok("Job moderated."));
    }
}
