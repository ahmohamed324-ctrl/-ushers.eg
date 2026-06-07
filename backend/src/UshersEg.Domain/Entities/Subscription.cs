using UshersEg.Domain.Common;

namespace UshersEg.Domain.Entities;

public class Subscription : BaseEntity
{
    public Guid UserId { get; set; }
    public string Plan { get; set; } = "free"; // free, starter, professional, enterprise
    public string? StripeCustomerId { get; set; }
    public string? StripeSubscriptionId { get; set; }
    public string? StripePriceId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? CurrentPeriodStart { get; set; }
    public DateTime? CurrentPeriodEnd { get; set; }
    public string Status { get; set; } = "active"; // active, canceled, past_due, trialing

    // Navigation
    public User User { get; set; } = null!;
}
