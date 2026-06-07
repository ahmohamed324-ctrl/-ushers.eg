using Microsoft.EntityFrameworkCore;
using UshersEg.Application.DTOs.Applications;
using UshersEg.Application.DTOs.Jobs;
using UshersEg.Application.Interfaces;
using UshersEg.Domain.Entities;
using UshersEg.Domain.Enums;
using UshersEg.Infrastructure.Data;

namespace UshersEg.Infrastructure.Services;

public class ApplicationService : IApplicationService
{
    private readonly ApplicationDbContext _db;
    private readonly IEmailService _email;

    public ApplicationService(ApplicationDbContext db, IEmailService email)
    {
        _db = db;
        _email = email;
    }

    public async Task<ApplicationDto> ApplyAsync(Guid userId, CreateApplicationDto dto)
    {
        var exists = await _db.Applications.AnyAsync(a => a.JobId == dto.JobId && a.UserId == userId);
        if (exists) throw new InvalidOperationException("You have already applied to this job.");

        var job = await _db.Jobs.Include(j => j.Company)
            .FirstOrDefaultAsync(j => j.Id == dto.JobId && j.Status == JobStatus.Active)
            ?? throw new KeyNotFoundException("Job not found or no longer accepting applications.");

        var user = await _db.Users.Include(u => u.UsherProfile)
            .FirstAsync(u => u.Id == userId);

        var app = new Domain.Entities.Application
        {
            JobId = dto.JobId,
            UserId = userId,
            CoverLetter = dto.CoverLetter,
            CvUrl = user.UsherProfile?.CvUrl,
            Status = ApplicationStatus.Pending
        };

        _db.Applications.Add(app);
        await _db.SaveChangesAsync();

        // Notify employer
        var employer = await _db.Users.FindAsync(job.PostedByUserId);
        if (employer is not null)
        {
            _db.Notifications.Add(new Notification
            {
                UserId = employer.Id,
                Title = "New Application",
                Message = $"{user.FullName} applied to '{job.Title}'",
                Type = "application",
                Link = $"/dashboard/employer?tab=applications"
            });
            await _db.SaveChangesAsync();

            // Email employer
            await _email.SendApplicationReceivedToEmployerAsync(employer.Email, employer.FirstName, job.Title, user.FullName);
        }

        // Notify Usher
        _db.Notifications.Add(new Notification
        {
            UserId = user.Id,
            Title = "Application Submitted",
            Message = $"You have successfully applied to '{job.Title}'.",
            Type = "application",
            Link = $"/dashboard/usher?tab=applications"
        });
        await _db.SaveChangesAsync();

        // Email Usher
        await _email.SendApplicationReceivedToUsherAsync(user.Email, user.FirstName, job.Title);

        return MapToDto(app, job, user);
    }

    public async Task<PagedResult<ApplicationDto>> GetMyApplicationsAsync(Guid userId, int page, int pageSize)
    {
        var q = _db.Applications
            .Include(a => a.Job).ThenInclude(j => j.Company)
            .Include(a => a.User)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt);

        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PagedResult<ApplicationDto>
        {
            Items = items.Select(a => MapToDto(a, a.Job, a.User)).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PagedResult<ApplicationDto>> GetJobApplicationsAsync(Guid employerUserId, Guid jobId, int page, int pageSize)
    {
        var job = await _db.Jobs.FirstOrDefaultAsync(j => j.Id == jobId && j.PostedByUserId == employerUserId)
            ?? throw new KeyNotFoundException("Job not found or unauthorized.");

        var q = _db.Applications
            .Include(a => a.User).ThenInclude(u => u.UsherProfile)
            .Include(a => a.Job).ThenInclude(j => j.Company)
            .Where(a => a.JobId == jobId)
            .OrderByDescending(a => a.CreatedAt);

        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PagedResult<ApplicationDto>
        {
            Items = items.Select(a => MapToDto(a, a.Job, a.User)).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ApplicationDto> UpdateStatusAsync(Guid employerUserId, Guid applicationId, UpdateApplicationStatusDto dto)
    {
        var app = await _db.Applications
            .Include(a => a.Job).ThenInclude(j => j.Company)
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == applicationId && a.Job.PostedByUserId == employerUserId)
            ?? throw new KeyNotFoundException("Application not found or unauthorized.");

        if (!Enum.TryParse<ApplicationStatus>(dto.Status, true, out var newStatus))
            throw new InvalidOperationException("Invalid status.");

        app.Status = newStatus;
        app.EmployerNote = dto.Note;
        app.ReviewedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        // Notify usher about acceptance/rejection
        var statusLabel = newStatus.ToString().ToLower();
        var statusEmoji = newStatus == ApplicationStatus.Accepted ? "🎉" : newStatus == ApplicationStatus.Rejected ? "😔" : "ℹ️";
        _db.Notifications.Add(new Notification
        {
            UserId = app.UserId,
            Title = newStatus == ApplicationStatus.Accepted
                ? "Application Accepted!"
                : newStatus == ApplicationStatus.Rejected
                    ? "Application Rejected"
                    : "Application Update",
            Message = $"{statusEmoji} Your application for '{app.Job.Title}' at {app.Job.Company?.Name ?? "the company"} has been {statusLabel}.",
            Type = "application",
            Link = $"/dashboard/usher?tab=applications"
        });

        // Notify employer (confirmation of their action)
        _db.Notifications.Add(new Notification
        {
            UserId = employerUserId,
            Title = $"Candidate {newStatus.ToString()}",
            Message = $"You have {statusLabel} {app.User.FullName}'s application for '{app.Job.Title}'.",
            Type = "application",
            Link = $"/dashboard/employer?tab=applications"
        });

        await _email.SendApplicationStatusUpdateAsync(app.User.Email, app.User.FirstName, app.Job.Title, newStatus.ToString());
        
        var employer = await _db.Users.FindAsync(employerUserId);
        if (employer != null)
        {
            await _email.SendApplicationStatusConfirmationToEmployerAsync(employer.Email, employer.FirstName, app.Job.Title, app.User.FullName, newStatus.ToString());
        }

        await _db.SaveChangesAsync();

        return MapToDto(app, app.Job, app.User);
    }

    public async Task WithdrawAsync(Guid userId, Guid applicationId)
    {
        var app = await _db.Applications.FirstOrDefaultAsync(a => a.Id == applicationId && a.UserId == userId)
            ?? throw new KeyNotFoundException("Application not found.");
        app.Status = ApplicationStatus.Withdrawn;
        await _db.SaveChangesAsync();
    }

    public async Task<bool> HasAppliedAsync(Guid userId, Guid jobId)
        => await _db.Applications.AnyAsync(a => a.UserId == userId && a.JobId == jobId);

    private static ApplicationDto MapToDto(Domain.Entities.Application a, Job job, User user) => new()
    {
        Id = a.Id,
        JobId = a.JobId,
        JobTitle = job.Title,
        CompanyName = job.Company?.Name ?? "",
        CompanyLogoUrl = job.Company?.LogoUrl,
        JobLocation = job.Location ?? "",
        CoverLetter = a.CoverLetter,
        CvUrl = a.CvUrl,
        Status = a.Status.ToString(),
        EmployerNote = a.EmployerNote,
        CreatedAt = a.CreatedAt,
        ReviewedAt = a.ReviewedAt,
        UserId = user.Id,
        CandidateName = user.FullName,
        CandidateAvatarUrl = user.AvatarUrl,
        CandidateLocation = user.Location,
        CandidateExperience = user.UsherProfile?.YearsOfExperience,
        CandidateProfile = user.UsherProfile == null ? null : new UshersEg.Application.DTOs.Users.UsherProfileDto
        {
            Age = user.UsherProfile.Age,
            Height = user.UsherProfile.Height,
            FormalPhotoUrl = user.UsherProfile.FormalPhotoUrl,
            CasualPhotoUrl = user.UsherProfile.CasualPhotoUrl,
            Appearance = user.UsherProfile.Appearance,
            University = user.UsherProfile.University,
            School = user.UsherProfile.School,
            Skills = user.UsherProfile.Skills,
            Languages = user.UsherProfile.Languages,
            Nationality = user.UsherProfile.Nationality,
            YearsOfExperience = user.UsherProfile.YearsOfExperience,
            HasTransportation = user.UsherProfile.HasTransportation,
            AvailableWeekends = user.UsherProfile.AvailableWeekends,
            ExpectedSalaryPerDay = user.UsherProfile.ExpectedSalaryPerDay,
            CompletionPercentage = user.UsherProfile.CompletionPercentage,
            CvUrl = user.UsherProfile.CvUrl
        }
    };
}
