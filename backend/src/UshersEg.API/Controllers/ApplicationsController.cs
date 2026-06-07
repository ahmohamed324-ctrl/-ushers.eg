using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UshersEg.Application.Common;
using UshersEg.Application.DTOs.Applications;
using UshersEg.Application.DTOs.Jobs;
using UshersEg.Application.Interfaces;

namespace UshersEg.API.Controllers;

[ApiController]
[Route("api/v1/applications")]
[Authorize]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _apps;

    public ApplicationsController(IApplicationService apps) => _apps = apps;

    private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [Authorize(Roles = "Usher")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ApplicationDto>>> Apply(CreateApplicationDto dto)
    {
        try
        {
            var result = await _apps.ApplyAsync(UserId, dto);
            return Ok(ApiResponse<ApplicationDto>.Ok(result, "Application submitted!"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<ApplicationDto>.Fail(ex.Message));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<ApplicationDto>.Fail(ex.Message));
        }
    }

    [Authorize(Roles = "Usher")]
    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<PagedResult<ApplicationDto>>>> GetMyApplications([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _apps.GetMyApplicationsAsync(UserId, page, pageSize);
        return Ok(ApiResponse<PagedResult<ApplicationDto>>.Ok(result));
    }

    [Authorize(Roles = "Employer")]
    [HttpGet("job/{jobId:guid}")]
    public async Task<ActionResult<ApiResponse<PagedResult<ApplicationDto>>>> GetJobApplications(Guid jobId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var result = await _apps.GetJobApplicationsAsync(UserId, jobId, page, pageSize);
            return Ok(ApiResponse<PagedResult<ApplicationDto>>.Ok(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<PagedResult<ApplicationDto>>.Fail(ex.Message));
        }
    }

    [Authorize(Roles = "Employer")]
    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<ApiResponse<ApplicationDto>>> UpdateStatus(Guid id, UpdateApplicationStatusDto dto)
    {
        try
        {
            var result = await _apps.UpdateStatusAsync(UserId, id, dto);
            return Ok(ApiResponse<ApplicationDto>.Ok(result, "Application status updated."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<ApplicationDto>.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<ApplicationDto>.Fail(ex.Message));
        }
    }

    [Authorize(Roles = "Usher")]
    [HttpPatch("{id:guid}/withdraw")]
    public async Task<ActionResult<ApiResponse>> Withdraw(Guid id)
    {
        try
        {
            await _apps.WithdrawAsync(UserId, id);
            return Ok(ApiResponse.Ok("Application withdrawn."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.Fail(ex.Message));
        }
    }
}
