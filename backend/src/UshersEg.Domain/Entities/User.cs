using UshersEg.Domain.Common;
using UshersEg.Domain.Enums;

namespace UshersEg.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Gender { get; set; } // "Male" or "Female"
    public string? Bio { get; set; }
    public string? Location { get; set; }
    public UserRole Role { get; set; } = UserRole.Usher;
    public bool IsVerified { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public string? EmailVerificationToken { get; set; }
    public DateTime? EmailVerificationTokenExpiry { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
    public string PreferredLanguage { get; set; } = "en";

    // Navigation
    public Company? Company { get; set; }
    public UsherProfile? UsherProfile { get; set; }
    public ICollection<Job> PostedJobs { get; set; } = new List<Job>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
    public ICollection<SavedJob> SavedJobs { get; set; } = new List<SavedJob>();
    public ICollection<Message> SentMessages { get; set; } = new List<Message>();
    public ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public Subscription? Subscription { get; set; }

    public string FullName => $"{FirstName} {LastName}";
}
