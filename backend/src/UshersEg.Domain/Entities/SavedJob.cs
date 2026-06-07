using UshersEg.Domain.Common;

namespace UshersEg.Domain.Entities;

public class SavedJob : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid JobId { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public Job Job { get; set; } = null!;
}
