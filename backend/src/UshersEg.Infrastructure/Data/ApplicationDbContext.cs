using Microsoft.EntityFrameworkCore;
using UshersEg.Domain.Entities;

namespace UshersEg.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<Domain.Entities.Application> Applications => Set<Domain.Entities.Application>();
    public DbSet<UsherProfile> UsherProfiles => Set<UsherProfile>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SavedJob> SavedJobs => Set<SavedJob>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global soft-delete filter
        modelBuilder.Entity<User>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<Company>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<Job>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<Domain.Entities.Application>().HasQueryFilter(x => !x.IsDeleted);

        // User
        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.Email).IsUnique();
            b.Property(x => x.Email).IsRequired().HasMaxLength(256);
            b.Property(x => x.FirstName).IsRequired().HasMaxLength(100);
            b.Property(x => x.LastName).IsRequired().HasMaxLength(100);
        });

        // Company - one-to-one with User
        modelBuilder.Entity<Company>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasOne(x => x.User).WithOne(x => x.Company)
                .HasForeignKey<Company>(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // UsherProfile - one-to-one with User
        modelBuilder.Entity<UsherProfile>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasOne(x => x.User).WithOne(x => x.UsherProfile)
                .HasForeignKey<UsherProfile>(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // Job - many-to-one with Company
        modelBuilder.Entity<Job>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasOne(x => x.Company).WithMany(x => x.Jobs)
                .HasForeignKey(x => x.CompanyId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.PostedByUser).WithMany(x => x.PostedJobs)
                .HasForeignKey(x => x.PostedByUserId).OnDelete(DeleteBehavior.Restrict);
            b.Property(x => x.SalaryMin).HasPrecision(18, 2);
            b.Property(x => x.SalaryMax).HasPrecision(18, 2);
        });

        // Application - many-to-one with Job and User
        modelBuilder.Entity<Domain.Entities.Application>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.JobId, x.UserId }).IsUnique();
            b.HasOne(x => x.Job).WithMany(x => x.Applications)
                .HasForeignKey(x => x.JobId).OnDelete(DeleteBehavior.Cascade);
            b.HasOne(x => x.User).WithMany(x => x.Applications)
                .HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        // SavedJob
        modelBuilder.Entity<SavedJob>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.UserId, x.JobId }).IsUnique();
            b.HasOne(x => x.User).WithMany(x => x.SavedJobs)
                .HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            b.HasOne(x => x.Job).WithMany(x => x.SavedBy)
                .HasForeignKey(x => x.JobId).OnDelete(DeleteBehavior.Cascade);
        });

        // Message
        modelBuilder.Entity<Message>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasOne(x => x.Sender).WithMany(x => x.SentMessages)
                .HasForeignKey(x => x.SenderId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Receiver).WithMany(x => x.ReceivedMessages)
                .HasForeignKey(x => x.ReceiverId).OnDelete(DeleteBehavior.Restrict);
        });

        // Notification
        modelBuilder.Entity<Notification>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasOne(x => x.User).WithMany(x => x.Notifications)
                .HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // Subscription
        modelBuilder.Entity<Subscription>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasOne(x => x.User).WithOne(x => x.Subscription)
                .HasForeignKey<Subscription>(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is Domain.Common.BaseEntity baseEntity)
            {
                if (entry.State == EntityState.Modified)
                    baseEntity.UpdatedAt = DateTime.UtcNow;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
