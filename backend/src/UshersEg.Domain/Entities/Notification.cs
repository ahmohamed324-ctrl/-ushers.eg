using UshersEg.Domain.Common;

namespace UshersEg.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Link { get; set; }
    public string Type { get; set; } = "info"; // info, success, warning, application
    public bool IsRead { get; set; } = false;

    // Navigation
    public User User { get; set; } = null!;
}
