namespace UshersEg.Application.DTOs.Companies;

public class CreateCompanyDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Industry { get; set; }
    public string? Location { get; set; }
    public string? Website { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public int? Founded { get; set; }
    public string? Size { get; set; }
}

public class CompanyDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? Description { get; set; }
    public string? Industry { get; set; }
    public string? Location { get; set; }
    public string? Website { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public int? Founded { get; set; }
    public string? Size { get; set; }
    public bool IsVerified { get; set; }
    public bool IsFeatured { get; set; }
    public int TotalJobs { get; set; }
    public int ActiveJobs { get; set; }
    public DateTime CreatedAt { get; set; }
}
