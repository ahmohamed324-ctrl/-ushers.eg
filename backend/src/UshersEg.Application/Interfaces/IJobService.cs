using UshersEg.Application.DTOs.Jobs;

namespace UshersEg.Application.Interfaces;

public interface IJobService
{
    Task<PagedResult<JobDto>> GetJobsAsync(JobSearchDto query, Guid? currentUserId);
    Task<JobDto?> GetJobByIdAsync(Guid id, Guid? currentUserId);
    Task<JobDto> CreateJobAsync(Guid userId, CreateJobDto dto);
    Task<JobDto> UpdateJobAsync(Guid userId, Guid jobId, UpdateJobDto dto);
    Task DeleteJobAsync(Guid userId, Guid jobId);
    Task<PagedResult<JobDto>> GetMyJobsAsync(Guid userId, int page, int pageSize);
    Task<bool> ToggleSaveJobAsync(Guid userId, Guid jobId);
    Task<PagedResult<JobDto>> GetSavedJobsAsync(Guid userId, int page, int pageSize);
    Task IncrementViewAsync(Guid jobId);
}
