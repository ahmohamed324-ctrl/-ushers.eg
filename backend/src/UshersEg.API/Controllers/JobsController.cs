using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UshersEg.Application.Common;
using UshersEg.Application.DTOs.Jobs;
using UshersEg.Application.Interfaces;

namespace UshersEg.API.Controllers;

[ApiController]
[Route("api/v1/jobs")]
public class JobsController : ControllerBase
{
    private readonly IJobService _jobs;

    public JobsController(IJobService jobs) => _jobs = jobs;

    private Guid? CurrentUserId => User.Identity?.IsAuthenticated == true
        ? Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value)
        : null;

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<JobDto>>>> GetJobs([FromQuery] JobSearchDto query)
    {
        var result = await _jobs.GetJobsAsync(query, CurrentUserId);
        return Ok(ApiResponse<PagedResult<JobDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<JobDto>>> GetJob(Guid id)
    {
        await _jobs.IncrementViewAsync(id);
        var result = await _jobs.GetJobByIdAsync(id, CurrentUserId);
        if (result is null) return NotFound(ApiResponse<JobDto>.Fail("Job not found."));
        return Ok(ApiResponse<JobDto>.Ok(result));
    }

    [Authorize(Roles = "Employer,Admin")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<JobDto>>> CreateJob(CreateJobDto dto)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _jobs.CreateJobAsync(userId, dto);
            return CreatedAtAction(nameof(GetJob), new { id = result.Id }, ApiResponse<JobDto>.Ok(result, "Job posted successfully!"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<JobDto>.Fail(ex.Message));
        }
    }

    [Authorize(Roles = "Employer,Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<JobDto>>> UpdateJob(Guid id, UpdateJobDto dto)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _jobs.UpdateJobAsync(userId, id, dto);
            return Ok(ApiResponse<JobDto>.Ok(result, "Job updated."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<JobDto>.Fail(ex.Message));
        }
    }

    [Authorize(Roles = "Employer,Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse>> DeleteJob(Guid id)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _jobs.DeleteJobAsync(userId, id);
            return Ok(ApiResponse.Ok("Job deleted."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.Fail(ex.Message));
        }
    }

    [Authorize(Roles = "Employer")]
    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<PagedResult<JobDto>>>> GetMyJobs([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await _jobs.GetMyJobsAsync(userId, page, pageSize);
        return Ok(ApiResponse<PagedResult<JobDto>>.Ok(result));
    }

    [Authorize]
    [HttpPost("{id:guid}/save")]
    public async Task<ActionResult<ApiResponse<bool>>> ToggleSave(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var saved = await _jobs.ToggleSaveJobAsync(userId, id);
        return Ok(ApiResponse<bool>.Ok(saved, saved ? "Job saved." : "Job unsaved."));
    }

    [Authorize]
    [HttpGet("saved")]
    public async Task<ActionResult<ApiResponse<PagedResult<JobDto>>>> GetSavedJobs([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await _jobs.GetSavedJobsAsync(userId, page, pageSize);
        return Ok(ApiResponse<PagedResult<JobDto>>.Ok(result));
    }
}
