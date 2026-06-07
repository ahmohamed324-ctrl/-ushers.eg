using Microsoft.EntityFrameworkCore;
using UshersEg.Application.DTOs.Jobs;
using UshersEg.Application.Interfaces;
using UshersEg.Domain.Entities;
using UshersEg.Domain.Enums;
using UshersEg.Infrastructure.Data;

namespace UshersEg.Infrastructure.Services;

public class JobService : IJobService
{
    private readonly ApplicationDbContext _db;
    private readonly IEmailService _email;

    public JobService(ApplicationDbContext db, IEmailService email)
    {
        _db = db;
        _email = email;
    }

    public async Task<PagedResult<JobDto>> GetJobsAsync(JobSearchDto query, Guid? currentUserId)
    {
        var q = _db.Jobs
            .Include(j => j.Company)
            .Where(j => j.Status == JobStatus.Active);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.ToLower();
            q = q.Where(j => j.Title.ToLower().Contains(s) ||
                             j.Description.ToLower().Contains(s) ||
                             j.Company.Name.ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(query.Category))
            q = q.Where(j => j.Category.ToLower() == query.Category.ToLower());

        if (!string.IsNullOrWhiteSpace(query.Location))
            q = q.Where(j => j.Location != null && j.Location.ToLower().Contains(query.Location.ToLower()));

        if (!string.IsNullOrWhiteSpace(query.Type) && Enum.TryParse<JobType>(query.Type, true, out var jt))
            q = q.Where(j => j.Type == jt);

        if (!string.IsNullOrWhiteSpace(query.ExperienceLevel) && Enum.TryParse<ExperienceLevel>(query.ExperienceLevel, true, out var el))
            q = q.Where(j => j.ExperienceLevel == el);

        if (query.SalaryMin.HasValue)
            q = q.Where(j => j.SalaryMin >= query.SalaryMin);

        if (query.SalaryMax.HasValue)
            q = q.Where(j => j.SalaryMax <= query.SalaryMax);

        if (query.IsRemote.HasValue)
            q = q.Where(j => j.IsRemote == query.IsRemote);

        q = query.SortBy switch
        {
            "salary" => query.SortOrder == "asc" ? q.OrderBy(j => j.SalaryMin) : q.OrderByDescending(j => j.SalaryMax),
            "views" => q.OrderByDescending(j => j.ViewsCount),
            _ => q.OrderByDescending(j => j.IsFeatured).ThenByDescending(j => j.CreatedAt)
        };

        var total = await q.CountAsync();
        var items = await q
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var savedJobIds = currentUserId.HasValue
            ? await _db.SavedJobs.Where(s => s.UserId == currentUserId).Select(s => s.JobId).ToListAsync()
            : new List<Guid>();

        var appliedJobIds = currentUserId.HasValue
            ? await _db.Applications.Where(a => a.UserId == currentUserId).Select(a => a.JobId).ToListAsync()
            : new List<Guid>();

        return new PagedResult<JobDto>
        {
            Items = items.Select(j => MapToDto(j, savedJobIds, appliedJobIds)).ToList(),
            TotalCount = total,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<JobDto?> GetJobByIdAsync(Guid id, Guid? currentUserId)
    {
        var job = await _db.Jobs
            .Include(j => j.Company)
            .Include(j => j.Applications)
            .FirstOrDefaultAsync(j => j.Id == id);

        if (job is null) return null;

        var savedJobIds = currentUserId.HasValue
            ? await _db.SavedJobs.Where(s => s.UserId == currentUserId).Select(s => s.JobId).ToListAsync()
            : new List<Guid>();
        var appliedJobIds = currentUserId.HasValue
            ? await _db.Applications.Where(a => a.UserId == currentUserId).Select(a => a.JobId).ToListAsync()
            : new List<Guid>();

        return MapToDto(job, savedJobIds, appliedJobIds);
    }

    public async Task<JobDto> CreateJobAsync(Guid userId, CreateJobDto dto)
    {
        var company = await _db.Companies.FirstOrDefaultAsync(c => c.UserId == userId)
            ?? throw new InvalidOperationException("Please create a company profile first.");

        var job = new Job
        {
            CompanyId = company.Id,
            PostedByUserId = userId,
            Title = dto.Title,
            Description = dto.Description,
            Requirements = dto.Requirements,
            Benefits = dto.Benefits,
            Location = dto.Location,
            IsRemote = dto.IsRemote,
            Type = Enum.TryParse<JobType>(dto.Type, true, out var jt) ? jt : JobType.Event,
            ExperienceLevel = Enum.TryParse<ExperienceLevel>(dto.ExperienceLevel, true, out var el) ? el : ExperienceLevel.Entry,
            SalaryMin = dto.SalaryMin,
            SalaryMax = dto.SalaryMax,
            SalaryCurrency = dto.SalaryCurrency,
            SalaryPeriod = dto.SalaryPeriod,
            Category = dto.Category,
            Skills = dto.Skills,
            EventDate = dto.EventDate,
            OpeningsCount = dto.OpeningsCount,
            Deadline = dto.Deadline,
            Status = JobStatus.Active
        };

        _db.Jobs.Add(job);
        await _db.SaveChangesAsync();

        var created = await _db.Jobs.Include(j => j.Company).FirstAsync(j => j.Id == job.Id);

        // Notify all Ushers
        var ushers = await _db.Users
            .Where(u => u.Role == UserRole.Usher && u.IsActive)
            .Select(u => new { u.Id, u.Email, u.FirstName })
            .ToListAsync();

        var notifications = ushers.Select(u => new Notification
        {
            UserId = u.Id,
            Title = "New Job Opportunity",
            Message = $"{company.Name} posted a new job: {job.Title}",
            Type = "job",
            Link = $"/jobs/{job.Id}"
        }).ToList();

        _db.Notifications.AddRange(notifications);
        await _db.SaveChangesAsync();

        // Send emails in background
        _ = Task.Run(async () =>
        {
            foreach (var u in ushers)
            {
                await _email.SendNewJobNotificationToUsherAsync(u.Email, u.FirstName, job.Title, company.Name);
            }
        });

        return MapToDto(created, new List<Guid>(), new List<Guid>());
    }

    public async Task<JobDto> UpdateJobAsync(Guid userId, Guid jobId, UpdateJobDto dto)
    {
        var user = await _db.Users.FindAsync(userId);
        var isAdmin = user?.Role == UserRole.Admin;

        var job = await _db.Jobs.Include(j => j.Company)
            .FirstOrDefaultAsync(j => j.Id == jobId && (isAdmin || j.PostedByUserId == userId))
            ?? throw new KeyNotFoundException("Job not found or unauthorized.");

        job.Title = dto.Title;
        job.Description = dto.Description;
        job.Requirements = dto.Requirements;
        job.Benefits = dto.Benefits;
        job.Location = dto.Location;
        job.IsRemote = dto.IsRemote;
        job.Type = Enum.TryParse<JobType>(dto.Type, true, out var jt) ? jt : job.Type;
        job.ExperienceLevel = Enum.TryParse<ExperienceLevel>(dto.ExperienceLevel, true, out var el) ? el : job.ExperienceLevel;
        job.SalaryMin = dto.SalaryMin;
        job.SalaryMax = dto.SalaryMax;
        job.SalaryCurrency = dto.SalaryCurrency;
        job.SalaryPeriod = dto.SalaryPeriod;
        job.Category = dto.Category;
        job.Skills = dto.Skills;
        job.EventDate = dto.EventDate;
        job.OpeningsCount = dto.OpeningsCount;
        job.Deadline = dto.Deadline;

        if (!string.IsNullOrWhiteSpace(dto.Status) && Enum.TryParse<JobStatus>(dto.Status, true, out var js))
            job.Status = js;

        await _db.SaveChangesAsync();
        return MapToDto(job, new List<Guid>(), new List<Guid>());
    }

    public async Task DeleteJobAsync(Guid userId, Guid jobId)
    {
        var user = await _db.Users.FindAsync(userId);
        var isAdmin = user?.Role == UserRole.Admin;

        var job = await _db.Jobs.FirstOrDefaultAsync(j => j.Id == jobId && (isAdmin || j.PostedByUserId == userId))
            ?? throw new KeyNotFoundException("Job not found or unauthorized.");
        job.IsDeleted = true;
        job.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task<PagedResult<JobDto>> GetMyJobsAsync(Guid userId, int page, int pageSize)
    {
        var q = _db.Jobs.Include(j => j.Company).Include(j => j.Applications)
            .Where(j => j.PostedByUserId == userId)
            .OrderByDescending(j => j.CreatedAt);

        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PagedResult<JobDto>
        {
            Items = items.Select(j => MapToDto(j, new List<Guid>(), new List<Guid>())).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<bool> ToggleSaveJobAsync(Guid userId, Guid jobId)
    {
        var saved = await _db.SavedJobs.FirstOrDefaultAsync(s => s.UserId == userId && s.JobId == jobId);
        if (saved is not null)
        {
            _db.SavedJobs.Remove(saved);
            await _db.SaveChangesAsync();
            return false;
        }
        _db.SavedJobs.Add(new SavedJob { UserId = userId, JobId = jobId });
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<PagedResult<JobDto>> GetSavedJobsAsync(Guid userId, int page, int pageSize)
    {
        var q = _db.SavedJobs
            .Where(s => s.UserId == userId)
            .Include(s => s.Job).ThenInclude(j => j.Company)
            .Select(s => s.Job)
            .OrderByDescending(j => j.CreatedAt);

        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var savedIds = items.Select(j => j.Id).ToList();

        return new PagedResult<JobDto>
        {
            Items = items.Select(j => MapToDto(j, savedIds, new List<Guid>())).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task IncrementViewAsync(Guid jobId)
    {
        await _db.Jobs.Where(j => j.Id == jobId)
            .ExecuteUpdateAsync(s => s.SetProperty(j => j.ViewsCount, j => j.ViewsCount + 1));
    }

    private static JobDto MapToDto(Job job, List<Guid> savedIds, List<Guid> appliedIds) => new()
    {
        Id = job.Id,
        Title = job.Title,
        Description = job.Description,
        Requirements = job.Requirements,
        Benefits = job.Benefits,
        Location = job.Location,
        IsRemote = job.IsRemote,
        Type = job.Type.ToString(),
        Status = job.Status.ToString(),
        ExperienceLevel = job.ExperienceLevel.ToString(),
        SalaryMin = job.SalaryMin,
        SalaryMax = job.SalaryMax,
        SalaryCurrency = job.SalaryCurrency,
        SalaryPeriod = job.SalaryPeriod,
        Category = job.Category,
        Skills = job.Skills,
        EventDate = job.EventDate,
        OpeningsCount = job.OpeningsCount,
        Deadline = job.Deadline,
        ViewsCount = job.ViewsCount,
        IsFeatured = job.IsFeatured,
        CreatedAt = job.CreatedAt,
        ApplicationsCount = job.Applications?.Count ?? 0,
        HasApplied = appliedIds.Contains(job.Id),
        IsSaved = savedIds.Contains(job.Id),
        Company = new CompanyBriefDto
        {
            Id = job.Company.Id,
            Name = job.Company.Name,
            LogoUrl = job.Company.LogoUrl,
            Location = job.Company.Location,
            IsVerified = job.Company.IsVerified
        }
    };
}
