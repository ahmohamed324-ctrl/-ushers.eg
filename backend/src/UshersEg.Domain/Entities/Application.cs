using UshersEg.Domain.Common;
using UshersEg.Domain.Enums;

namespace UshersEg.Domain.Entities;

public class Application : BaseEntity
{
    public Guid JobId { get; set; }
    public Guid UserId { get; set; }
    public string? CoverLetter { get; set; }
    public string? CvUrl { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public string? EmployerNote { get; set; }
    public DateTime? ReviewedAt { get; set; }

    // Navigation
    public Job Job { get; set; } = null!;
    public User User { get; set; } = null!;
}
