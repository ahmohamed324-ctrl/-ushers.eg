using UshersEg.Domain.Common;
using UshersEg.Domain.Enums;

namespace UshersEg.Domain.Entities;

public class Job : BaseEntity
{
    public Guid CompanyId { get; set; }
    public Guid PostedByUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Requirements { get; set; }
    public string? Benefits { get; set; }
    public string? Location { get; set; }
    public bool IsRemote { get; set; } = false;
    public JobType Type { get; set; } = JobType.Event;
    public JobStatus Status { get; set; } = JobStatus.Active;
    public ExperienceLevel ExperienceLevel { get; set; } = ExperienceLevel.Entry;
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? SalaryCurrency { get; set; } = "EGP";
    public string? SalaryPeriod { get; set; } = "day"; // hour, day, month, event
    public string Category { get; set; } = string.Empty; // e.g. "Conference", "Wedding", "Corporate"
    public string? Skills { get; set; } // comma-separated
    public DateTime? EventDate { get; set; }
    public int? OpeningsCount { get; set; } = 1;
    public DateTime? Deadline { get; set; }
    public int ViewsCount { get; set; } = 0;
    public bool IsFeatured { get; set; } = false;

    // Navigation
    public Company Company { get; set; } = null!;
    public User PostedByUser { get; set; } = null!;
    public ICollection<Application> Applications { get; set; } = new List<Application>();
    public ICollection<SavedJob> SavedBy { get; set; } = new List<SavedJob>();
}
