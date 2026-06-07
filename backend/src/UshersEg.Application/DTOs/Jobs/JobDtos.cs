using UshersEg.Domain.Enums;

namespace UshersEg.Application.DTOs.Jobs;

public class CreateJobDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Requirements { get; set; }
    public string? Benefits { get; set; }
    public string? Location { get; set; }
    public bool IsRemote { get; set; } = false;
    public string Type { get; set; } = "Event";
    public string ExperienceLevel { get; set; } = "Entry";
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? SalaryCurrency { get; set; } = "EGP";
    public string? SalaryPeriod { get; set; } = "day";
    public string Category { get; set; } = string.Empty;
    public string? Skills { get; set; }
    public DateTime? EventDate { get; set; }
    public int? OpeningsCount { get; set; } = 1;
    public DateTime? Deadline { get; set; }
}

public class UpdateJobDto : CreateJobDto
{
    public string? Status { get; set; }
}

public class JobDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Requirements { get; set; }
    public string? Benefits { get; set; }
    public string? Location { get; set; }
    public bool IsRemote { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string ExperienceLevel { get; set; } = string.Empty;
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? SalaryCurrency { get; set; }
    public string? SalaryPeriod { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Skills { get; set; }
    public DateTime? EventDate { get; set; }
    public int? OpeningsCount { get; set; }
    public DateTime? Deadline { get; set; }
    public int ViewsCount { get; set; }
    public bool IsFeatured { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ApplicationsCount { get; set; }
    public bool? HasApplied { get; set; }
    public bool? IsSaved { get; set; }
    public CompanyBriefDto Company { get; set; } = null!;
}

public class CompanyBriefDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? Location { get; set; }
    public bool IsVerified { get; set; }
}

public class JobSearchDto
{
    public string? Search { get; set; }
    public string? Category { get; set; }
    public string? Location { get; set; }
    public string? Type { get; set; }
    public string? ExperienceLevel { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public bool? IsRemote { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortBy { get; set; } = "createdAt"; // createdAt, salary, views
    public string? SortOrder { get; set; } = "desc";
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}
