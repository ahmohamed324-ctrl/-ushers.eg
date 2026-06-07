namespace UshersEg.Application.DTOs.Users;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string? Location { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
    public bool IsActive { get; set; }
    public string PreferredLanguage { get; set; } = "en";
    public DateTime CreatedAt { get; set; }
    public UsherProfileDto? UsherProfile { get; set; }
}

public class UpdateProfileDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Bio { get; set; }
    public string? Location { get; set; }
    public string? PreferredLanguage { get; set; }
}

public class UsherProfileDto
{
    public string? CvUrl { get; set; }
    public string? FormalPhotoUrl { get; set; }
    public string? CasualPhotoUrl { get; set; }
    public int? Age { get; set; }
    public string? University { get; set; }
    public string? School { get; set; }
    public string? Skills { get; set; }
    public string? Languages { get; set; }
    public string? Nationality { get; set; }
    public int? YearsOfExperience { get; set; }
    public string? Height { get; set; }
    public string? Appearance { get; set; }
    public bool HasTransportation { get; set; }
    public bool AvailableWeekends { get; set; }
    public decimal? ExpectedSalaryPerDay { get; set; }
    public int CompletionPercentage { get; set; }
}

public class UpdateUsherProfileDto
{
    public int? Age { get; set; }
    public string? University { get; set; }
    public string? School { get; set; }
    public string? Skills { get; set; }
    public string? Languages { get; set; }
    public string? Nationality { get; set; }
    public int? YearsOfExperience { get; set; }
    public string? Height { get; set; }
    public string? Appearance { get; set; }
    public bool HasTransportation { get; set; }
    public bool AvailableWeekends { get; set; }
    public decimal? ExpectedSalaryPerDay { get; set; }
}
