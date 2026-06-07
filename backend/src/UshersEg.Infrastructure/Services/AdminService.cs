using Microsoft.EntityFrameworkCore;
using UshersEg.Application.DTOs.Admin;
using UshersEg.Application.DTOs.Jobs;
using UshersEg.Application.Interfaces;
using UshersEg.Infrastructure.Data;

namespace UshersEg.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly ApplicationDbContext _db;

    public AdminService(ApplicationDbContext db) => _db = db;

    public async Task<AdminDashboardDto> GetDashboardAsync()
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1);

        var totalUsers = await _db.Users.CountAsync();
        var totalEmployers = await _db.Users.CountAsync(u => u.Role == Domain.Enums.UserRole.Employer);
        var totalUshers = await _db.Users.CountAsync(u => u.Role == Domain.Enums.UserRole.Usher);
        var totalJobs = await _db.Jobs.CountAsync();
        var activeJobs = await _db.Jobs.CountAsync(j => j.Status == Domain.Enums.JobStatus.Active);
        var totalApplications = await _db.Applications.CountAsync();
        var totalCompanies = await _db.Companies.CountAsync();
        var newUsersThisMonth = await _db.Users.CountAsync(u => u.CreatedAt >= monthStart);
        var newJobsThisMonth = await _db.Jobs.CountAsync(j => j.CreatedAt >= monthStart);

        var recentUsers = await _db.Users.OrderByDescending(u => u.CreatedAt).Take(5)
            .Select(u => new RecentActivityDto { Type = "user", Title = u.FullName, SubTitle = u.Email, CreatedAt = u.CreatedAt })
            .ToListAsync();

        var recentJobs = await _db.Jobs.Include(j => j.Company).OrderByDescending(j => j.CreatedAt).Take(5)
            .Select(j => new RecentActivityDto { Type = "job", Title = j.Title, SubTitle = j.Company.Name, CreatedAt = j.CreatedAt })
            .ToListAsync();

        var recentActivity = recentUsers.Concat(recentJobs)
            .OrderByDescending(x => x.CreatedAt).Take(10).ToList();

        return new AdminDashboardDto
        {
            TotalUsers = totalUsers,
            TotalEmployers = totalEmployers,
            TotalUshers = totalUshers,
            TotalJobs = totalJobs,
            ActiveJobs = activeJobs,
            TotalApplications = totalApplications,
            TotalCompanies = totalCompanies,
            NewUsersThisMonth = newUsersThisMonth,
            NewJobsThisMonth = newJobsThisMonth,
            RecentActivity = recentActivity
        };
    }

    public async Task<PagedResult<AdminUserDto>> GetUsersAsync(string? search, string? role, int page, int pageSize)
    {
        var q = _db.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            q = q.Where(u => u.Email.ToLower().Contains(s) ||
                             u.FirstName.ToLower().Contains(s) ||
                             u.LastName.ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(role) && Enum.TryParse<Domain.Enums.UserRole>(role, true, out var r))
            q = q.Where(u => u.Role == r);

        q = q.OrderByDescending(u => u.CreatedAt);
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PagedResult<AdminUserDto>
        {
            Items = items.Select(u => new AdminUserDto
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                AvatarUrl = u.AvatarUrl,
                Role = u.Role.ToString(),
                IsVerified = u.IsVerified,
                IsActive = u.IsActive,
                Location = u.Location,
                CreatedAt = u.CreatedAt
            }).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<bool> ToggleUserActiveAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId) ?? throw new KeyNotFoundException("User not found.");
        user.IsActive = !user.IsActive;
        await _db.SaveChangesAsync();
        return user.IsActive;
    }

    public async Task<UshersEg.Application.DTOs.Users.UserProfileDto> GetUserProfileAsync(Guid userId)
    {
        var user = await _db.Users.Include(u => u.UsherProfile).FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("User not found.");

        return new UshersEg.Application.DTOs.Users.UserProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Role = user.Role.ToString(),
            AvatarUrl = user.AvatarUrl,
            IsVerified = user.IsVerified,
            PreferredLanguage = user.PreferredLanguage,
            Location = user.Location,
            CreatedAt = user.CreatedAt,
            UsherProfile = user.UsherProfile != null ? new UshersEg.Application.DTOs.Users.UsherProfileDto
            {
                Age = user.UsherProfile.Age,
                Height = user.UsherProfile.Height,
                Appearance = user.UsherProfile.Appearance,
                YearsOfExperience = user.UsherProfile.YearsOfExperience,
                ExpectedSalaryPerDay = user.UsherProfile.ExpectedSalaryPerDay,
                Nationality = user.UsherProfile.Nationality,
                School = user.UsherProfile.School,
                University = user.UsherProfile.University,
                HasTransportation = user.UsherProfile.HasTransportation,
                Languages = user.UsherProfile.Languages,
                AvailableWeekends = user.UsherProfile.AvailableWeekends,
                FormalPhotoUrl = user.UsherProfile.FormalPhotoUrl,
                CasualPhotoUrl = user.UsherProfile.CasualPhotoUrl
            } : null
        };
    }

    public async Task DeleteUserAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId) ?? throw new KeyNotFoundException("User not found.");
        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task<PagedResult<object>> GetJobsAsync(string? search, string? status, int page, int pageSize)
    {
        var q = _db.Jobs.Include(j => j.Company).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            q = q.Where(j => j.Title.ToLower().Contains(s) || j.Company.Name.ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<Domain.Enums.JobStatus>(status, true, out var js))
            q = q.Where(j => j.Status == js);

        q = q.OrderByDescending(j => j.CreatedAt);
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PagedResult<object>
        {
            Items = items.Select(j => (object)new
            {
                j.Id, j.Title, Status = j.Status.ToString(), j.IsFeatured,
                Company = j.Company.Name, j.Location, j.CreatedAt, j.ViewsCount
            }).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task ModerateJobAsync(Guid jobId, ModerateJobDto dto)
    {
        var job = await _db.Jobs.FindAsync(jobId) ?? throw new KeyNotFoundException("Job not found.");
        if (!string.IsNullOrWhiteSpace(dto.Status) && Enum.TryParse<Domain.Enums.JobStatus>(dto.Status, true, out var js))
            job.Status = js;
        if (dto.IsFeatured.HasValue)
            job.IsFeatured = dto.IsFeatured.Value;
        await _db.SaveChangesAsync();
    }
}
