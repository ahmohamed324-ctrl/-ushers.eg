namespace UshersEg.Application.DTOs.Applications;

public class CreateApplicationDto
{
    public Guid JobId { get; set; }
    public string? CoverLetter { get; set; }
}

public class ApplicationDto
{
    public Guid Id { get; set; }
    public Guid JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? CompanyLogoUrl { get; set; }
    public string JobLocation { get; set; } = string.Empty;
    public string? CoverLetter { get; set; }
    public string? CvUrl { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? EmployerNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    // Candidate info (for employer view)
    public Guid UserId { get; set; }
    public string? CandidateName { get; set; }
    public string? CandidateAvatarUrl { get; set; }
    public string? CandidateLocation { get; set; }
    public int? CandidateExperience { get; set; }
    public UshersEg.Application.DTOs.Users.UsherProfileDto? CandidateProfile { get; set; }
}

public class UpdateApplicationStatusDto
{
    public string Status { get; set; } = string.Empty;
    public string? Note { get; set; }
}
