using UshersEg.Domain.Entities;
using UshersEg.Domain.Enums;

namespace UshersEg.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Ensure the global admin exists
        if (!context.Users.Any(u => u.Email == "ushers.recruting@gmail.com"))
        {
            var superAdmin = new User
            {
                Id = Guid.NewGuid(),
                Email = "ushers.recruting@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Hti@2026"),
                FirstName = "Ushers",
                LastName = "Admin",
                Role = UserRole.Admin,
                IsVerified = true,
                IsActive = true,
                PreferredLanguage = "en"
            };
            await context.Users.AddAsync(superAdmin);
            var superAdminSub = new Subscription { UserId = superAdmin.Id, Plan = "enterprise", IsActive = true, Status = "active" };
            await context.Subscriptions.AddAsync(superAdminSub);
            await context.SaveChangesAsync();
        }

        if (context.Users.Any(u => u.Email == "admin@UshersEg.com")) return;

        // ────────── Admin User ──────────
        var adminId = Guid.NewGuid();
        var admin = new User
        {
            Id = adminId,
            Email = "admin@UshersEg.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            FirstName = "Platform",
            LastName = "Admin",
            Role = UserRole.Admin,
            IsVerified = true,
            IsActive = true,
            PreferredLanguage = "en"
        };

        // ────────── Demo Employer ──────────
        var employerId = Guid.NewGuid();
        var employer = new User
        {
            Id = employerId,
            Email = "events@elitehost.eg",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Employer@123"),
            FirstName = "Ahmed",
            LastName = "Hassan",
            Role = UserRole.Employer,
            IsVerified = true,
            IsActive = true,
            Phone = "+201001234567",
            Location = "Cairo, Egypt",
            PreferredLanguage = "ar"
        };

        var company = new Company
        {
            Id = Guid.NewGuid(),
            UserId = employerId,
            Name = "Elite Host Events",
            Description = "Premier event management company specializing in high-end corporate and private events across Egypt.",
            Industry = "Event Management",
            Location = "Cairo, Egypt",
            Website = "https://elitehost.eg",
            Founded = 2015,
            Size = "11-50",
            IsVerified = true,
            IsFeatured = true
        };

        // ────────── Demo Usher ──────────
        var usherId = Guid.NewGuid();
        var usher = new User
        {
            Id = usherId,
            Email = "sara.usher@demo.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Usher@123"),
            FirstName = "Sara",
            LastName = "Mohamed",
            Role = UserRole.Usher,
            IsVerified = true,
            IsActive = true,
            Phone = "+201112345678",
            Location = "Giza, Egypt",
            Bio = "Professional usher with 3+ years of experience in corporate and luxury events.",
            PreferredLanguage = "ar"
        };

        var usherProfile = new UsherProfile
        {
            Id = Guid.NewGuid(),
            UserId = usherId,
            Skills = "Communication,Bilingual,Customer Service,Event Coordination",
            Languages = "Arabic,English,French",
            Nationality = "Egyptian",
            YearsOfExperience = 3,
            Height = "170cm",
            HasTransportation = true,
            AvailableWeekends = true,
            ExpectedSalaryPerDay = 500,
            CompletionPercentage = 85
        };

        // ────────── Demo Jobs ──────────
        var jobs = new List<Job>
        {
            new Job
            {
                Id = Guid.NewGuid(),
                CompanyId = company.Id,
                PostedByUserId = employerId,
                Title = "Event Usher – International Conference",
                Description = "We are looking for professional ushers for an international tech conference taking place in Cairo. You will be responsible for welcoming delegates, guiding them to sessions, and providing assistance throughout the event.",
                Requirements = "Fluent in English and Arabic,Professional appearance,Prior event experience preferred,Excellent communication skills",
                Benefits = "Competitive daily rate,Meals provided,Transportation allowance,Certificate of participation",
                Location = "Cairo International Convention Centre",
                Type = JobType.Event,
                Status = JobStatus.Active,
                ExperienceLevel = ExperienceLevel.Entry,
                SalaryMin = 600,
                SalaryMax = 800,
                SalaryCurrency = "EGP",
                SalaryPeriod = "day",
                Category = "Conference",
                Skills = "Communication,Bilingual,Customer Service",
                EventDate = DateTime.UtcNow.AddDays(14),
                OpeningsCount = 8,
                Deadline = DateTime.UtcNow.AddDays(7),
                IsFeatured = true,
                ViewsCount = 245
            },
            new Job
            {
                Id = Guid.NewGuid(),
                CompanyId = company.Id,
                PostedByUserId = employerId,
                Title = "Luxury Wedding Hostess",
                Description = "Seeking elegant and experienced hostesses for a high-profile luxury wedding celebration. Must maintain professionalism and grace throughout the event.",
                Requirements = "Excellent appearance,Bilingual (Arabic/English),Prior wedding/hospitality experience,Flexible availability",
                Location = "Four Seasons Hotel, Cairo",
                Type = JobType.Event,
                Status = JobStatus.Active,
                ExperienceLevel = ExperienceLevel.Junior,
                SalaryMin = 700,
                SalaryMax = 1000,
                SalaryCurrency = "EGP",
                SalaryPeriod = "day",
                Category = "Wedding",
                Skills = "Hospitality,Bilingual,Elegance",
                EventDate = DateTime.UtcNow.AddDays(21),
                OpeningsCount = 4,
                Deadline = DateTime.UtcNow.AddDays(10),
                IsFeatured = false,
                ViewsCount = 180
            },
            new Job
            {
                Id = Guid.NewGuid(),
                CompanyId = company.Id,
                PostedByUserId = employerId,
                Title = "Corporate Event Staff – Product Launch",
                Description = "Join our team for an exciting product launch event for a major international brand. Responsibilities include registration desk, guest management, and VIP assistance.",
                Location = "Hilton Ramses, Cairo",
                Type = JobType.Event,
                Status = JobStatus.Active,
                ExperienceLevel = ExperienceLevel.Entry,
                SalaryMin = 550,
                SalaryMax = 750,
                SalaryCurrency = "EGP",
                SalaryPeriod = "day",
                Category = "Corporate",
                Skills = "Registration,Customer Service,Bilingual",
                EventDate = DateTime.UtcNow.AddDays(30),
                OpeningsCount = 12,
                ViewsCount = 320
            }
        };

        // ────────── Subscriptions ──────────
        var adminSub = new Subscription { UserId = adminId, Plan = "enterprise", IsActive = true, Status = "active" };
        var employerSub = new Subscription { UserId = employerId, Plan = "professional", IsActive = true, Status = "active" };
        var usherSub = new Subscription { UserId = usherId, Plan = "free", IsActive = true, Status = "active" };

        await context.Users.AddRangeAsync(admin, employer, usher);
        await context.SaveChangesAsync();

        await context.Companies.AddAsync(company);
        await context.UsherProfiles.AddAsync(usherProfile);
        await context.SaveChangesAsync();

        await context.Jobs.AddRangeAsync(jobs);
        await context.SaveChangesAsync();

        await context.Subscriptions.AddRangeAsync(adminSub, employerSub, usherSub);
        await context.SaveChangesAsync();
    }
}
