using UshersEg.Application.DTOs.Applications;
using UshersEg.Application.DTOs.Jobs;

namespace UshersEg.Application.Interfaces;

public interface IApplicationService
{
    Task<ApplicationDto> ApplyAsync(Guid userId, CreateApplicationDto dto);
    Task<PagedResult<ApplicationDto>> GetMyApplicationsAsync(Guid userId, int page, int pageSize);
    Task<PagedResult<ApplicationDto>> GetJobApplicationsAsync(Guid employerUserId, Guid jobId, int page, int pageSize);
    Task<ApplicationDto> UpdateStatusAsync(Guid employerUserId, Guid applicationId, UpdateApplicationStatusDto dto);
    Task WithdrawAsync(Guid userId, Guid applicationId);
    Task<bool> HasAppliedAsync(Guid userId, Guid jobId);
}
