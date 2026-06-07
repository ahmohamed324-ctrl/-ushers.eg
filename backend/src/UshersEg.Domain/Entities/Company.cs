using UshersEg.Domain.Common;

namespace UshersEg.Domain.Entities;

public class Company : BaseEntity
{
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
    public string? Size { get; set; } // e.g. "1-10", "11-50", "50-200", "200+"
    public bool IsVerified { get; set; } = false;
    public bool IsFeatured { get; set; } = false;

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<Job> Jobs { get; set; } = new List<Job>();
}
