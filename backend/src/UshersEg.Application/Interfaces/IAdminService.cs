using UshersEg.Application.Common;
using UshersEg.Application.DTOs.Admin;
using UshersEg.Application.DTOs.Jobs;
using UshersEg.Application.DTOs.Users;

namespace UshersEg.Application.Interfaces;

public interface IAdminService
{
    Task<AdminDashboardDto> GetDashboardAsync();
    Task<PagedResult<AdminUserDto>> GetUsersAsync(string? search, string? role, int page, int pageSize);
    Task<bool> ToggleUserActiveAsync(Guid userId);
    Task<UserProfileDto> GetUserProfileAsync(Guid userId);
    Task DeleteUserAsync(Guid userId);
    Task<PagedResult<object>> GetJobsAsync(string? search, string? status, int page, int pageSize);
    Task ModerateJobAsync(Guid jobId, ModerateJobDto dto);
}
