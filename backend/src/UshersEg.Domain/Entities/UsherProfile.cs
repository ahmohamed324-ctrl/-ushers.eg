using UshersEg.Domain.Common;

namespace UshersEg.Domain.Entities;

public class UsherProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public string? CvUrl { get; set; }

    // Photo uploads
    public string? FormalPhotoUrl { get; set; }   // صورة رسمية
    public string? CasualPhotoUrl { get; set; }   // صورة عادية

    // Personal details
    public int? Age { get; set; }
    public string? University { get; set; }
    public string? School { get; set; }

    // Professional
    public string? Skills { get; set; } // comma-separated
    public string? Languages { get; set; }
    public string? Nationality { get; set; }
    public int? YearsOfExperience { get; set; }
    public string? Height { get; set; }
    public string? Appearance { get; set; }
    public bool HasTransportation { get; set; } = false;
    public bool AvailableWeekends { get; set; } = true;
    public string? AvailableDays { get; set; } // JSON array of days
    public decimal? ExpectedSalaryPerDay { get; set; }
    public int CompletionPercentage { get; set; } = 0;

    // Navigation
    public User User { get; set; } = null!;
}
