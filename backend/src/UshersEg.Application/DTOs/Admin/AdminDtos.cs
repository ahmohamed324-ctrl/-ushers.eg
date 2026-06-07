namespace UshersEg.Application.DTOs.Admin;

public class AdminDashboardDto
{
    public int TotalUsers { get; set; }
    public int TotalEmployers { get; set; }
    public int TotalUshers { get; set; }
    public int TotalJobs { get; set; }
    public int ActiveJobs { get; set; }
    public int TotalApplications { get; set; }
    public int TotalCompanies { get; set; }
    public int NewUsersThisMonth { get; set; }
    public int NewJobsThisMonth { get; set; }
    public List<MonthlyStatDto> MonthlyStats { get; set; } = new();
    public List<RecentActivityDto> RecentActivity { get; set; } = new();
}

public class MonthlyStatDto
{
    public string Month { get; set; } = string.Empty;
    public int Users { get; set; }
    public int Jobs { get; set; }
    public int Applications { get; set; }
}

public class RecentActivityDto
{
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? SubTitle { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminUserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
    public bool IsActive { get; set; }
    public string? Location { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ModerateJobDto
{
    public string Status { get; set; } = string.Empty; // Active, Closed, Pending
    public bool? IsFeatured { get; set; }
}
