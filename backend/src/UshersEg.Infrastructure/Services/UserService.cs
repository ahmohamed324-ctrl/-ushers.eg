using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using UshersEg.Application.DTOs.Users;
using UshersEg.Application.Interfaces;
using UshersEg.Domain.Entities;
using UshersEg.Infrastructure.Data;

namespace UshersEg.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _db;
    private readonly string _uploadPath;

    public UserService(ApplicationDbContext db, IConfiguration config)
    {
        _db = db;
        _uploadPath = config["UploadPath"] ?? "Uploads";
    }

    public async Task<UserProfileDto?> GetProfileAsync(Guid userId)
    {
        var user = await _db.Users
            .Include(u => u.UsherProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);
        return user is null ? null : MapToDto(user);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await _db.Users.FindAsync(userId) ?? throw new KeyNotFoundException("User not found.");
        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Phone = dto.Phone;
        user.Bio = dto.Bio;
        user.Location = dto.Location;
        if (!string.IsNullOrWhiteSpace(dto.PreferredLanguage))
            user.PreferredLanguage = dto.PreferredLanguage;
        await _db.SaveChangesAsync();

        return await GetProfileAsync(userId) ?? throw new Exception("Profile update failed.");
    }

    public async Task<string> UploadAvatarAsync(Guid userId, Stream fileStream, string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLower();
        var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        if (!allowed.Contains(ext)) throw new InvalidOperationException("Invalid file type.");

        var dir = Path.Combine(_uploadPath, "avatars");
        Directory.CreateDirectory(dir);
        var newName = $"{userId}{ext}";
        var fullPath = Path.Combine(dir, newName);

        using var fs = new FileStream(fullPath, FileMode.Create);
        await fileStream.CopyToAsync(fs);

        var url = $"/uploads/avatars/{newName}";
        var user = await _db.Users.FindAsync(userId)!;
        user!.AvatarUrl = url;
        await _db.SaveChangesAsync();
        return url;
    }

    public async Task<string> UploadCvAsync(Guid userId, Stream fileStream, string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLower();
        if (ext != ".pdf") throw new InvalidOperationException("Only PDF files are allowed for CVs.");

        var dir = Path.Combine(_uploadPath, "cvs");
        Directory.CreateDirectory(dir);
        var newName = $"{userId}_cv.pdf";
        var fullPath = Path.Combine(dir, newName);

        using var fs = new FileStream(fullPath, FileMode.Create);
        await fileStream.CopyToAsync(fs);

        var url = $"/uploads/cvs/{newName}";
        var profile = await _db.UsherProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile is not null)
        {
            profile.CvUrl = url;
            await _db.SaveChangesAsync();
        }
        return url;
    }

    public async Task<string> UploadFormalPhotoAsync(Guid userId, Stream fileStream, string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLower();
        var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        if (!allowed.Contains(ext)) throw new InvalidOperationException("Invalid file type. Use jpg, png or webp.");

        var dir = Path.Combine(_uploadPath, "photos");
        Directory.CreateDirectory(dir);
        var newName = $"{userId}_formal{ext}";
        var fullPath = Path.Combine(dir, newName);

        using var fs = new FileStream(fullPath, FileMode.Create);
        await fileStream.CopyToAsync(fs);

        var url = $"/uploads/photos/{newName}";
        var profile = await _db.UsherProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile is null)
        {
            profile = new UsherProfile { UserId = userId };
            _db.UsherProfiles.Add(profile);
        }
        profile.FormalPhotoUrl = url;
        await _db.SaveChangesAsync();
        return url;
    }

    public async Task<string> UploadCasualPhotoAsync(Guid userId, Stream fileStream, string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLower();
        var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        if (!allowed.Contains(ext)) throw new InvalidOperationException("Invalid file type. Use jpg, png or webp.");

        var dir = Path.Combine(_uploadPath, "photos");
        Directory.CreateDirectory(dir);
        var newName = $"{userId}_casual{ext}";
        var fullPath = Path.Combine(dir, newName);

        using var fs = new FileStream(fullPath, FileMode.Create);
        await fileStream.CopyToAsync(fs);

        var url = $"/uploads/photos/{newName}";
        var profile = await _db.UsherProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile is null)
        {
            profile = new UsherProfile { UserId = userId };
            _db.UsherProfiles.Add(profile);
        }
        profile.CasualPhotoUrl = url;
        await _db.SaveChangesAsync();
        return url;
    }

    public async Task<UserProfileDto> UpdateUsherProfileAsync(Guid userId, UpdateUsherProfileDto dto)
    {
        var profile = await _db.UsherProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile is null)
        {
            profile = new UsherProfile { UserId = userId };
            _db.UsherProfiles.Add(profile);
        }

        profile.Age = dto.Age;
        profile.University = dto.University;
        profile.School = dto.School;
        profile.Skills = dto.Skills;
        profile.Languages = dto.Languages;
        profile.Nationality = dto.Nationality;
        profile.YearsOfExperience = dto.YearsOfExperience;
        profile.Height = dto.Height;
        profile.Appearance = dto.Appearance;
        profile.HasTransportation = dto.HasTransportation;
        profile.AvailableWeekends = dto.AvailableWeekends;
        profile.ExpectedSalaryPerDay = dto.ExpectedSalaryPerDay;

        // Calculate completion %
        int fields = 0, filled = 0;
        var checks = new object?[] {
            dto.Skills, dto.Languages, dto.Nationality,
            dto.YearsOfExperience, dto.Height, dto.ExpectedSalaryPerDay,
            dto.Age, dto.University ?? dto.School
        };
        foreach (var c in checks) { fields++; if (c is not null) filled++; }
        profile.CompletionPercentage = (int)((double)filled / fields * 100);

        await _db.SaveChangesAsync();
        return await GetProfileAsync(userId) ?? throw new Exception("Update failed.");
    }

    public async Task<bool> ToggleActiveAsync(Guid adminId, Guid userId)
    {
        var user = await _db.Users.FindAsync(userId) ?? throw new KeyNotFoundException("User not found.");
        user.IsActive = !user.IsActive;
        await _db.SaveChangesAsync();
        return user.IsActive;
    }

    private static UserProfileDto MapToDto(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FirstName = user.FirstName,
        LastName = user.LastName,
        FullName = user.FullName,
        Phone = user.Phone,
        AvatarUrl = user.AvatarUrl,
        Bio = user.Bio,
        Location = user.Location,
        Role = user.Role.ToString(),
        IsVerified = user.IsVerified,
        IsActive = user.IsActive,
        PreferredLanguage = user.PreferredLanguage,
        CreatedAt = user.CreatedAt,
        UsherProfile = user.UsherProfile is null ? null : new UsherProfileDto
        {
            CvUrl = user.UsherProfile.CvUrl,
            FormalPhotoUrl = user.UsherProfile.FormalPhotoUrl,
            CasualPhotoUrl = user.UsherProfile.CasualPhotoUrl,
            Age = user.UsherProfile.Age,
            University = user.UsherProfile.University,
            School = user.UsherProfile.School,
            Skills = user.UsherProfile.Skills,
            Languages = user.UsherProfile.Languages,
            Nationality = user.UsherProfile.Nationality,
            YearsOfExperience = user.UsherProfile.YearsOfExperience,
            Height = user.UsherProfile.Height,
            Appearance = user.UsherProfile.Appearance,
            HasTransportation = user.UsherProfile.HasTransportation,
            AvailableWeekends = user.UsherProfile.AvailableWeekends,
            ExpectedSalaryPerDay = user.UsherProfile.ExpectedSalaryPerDay,
            CompletionPercentage = user.UsherProfile.CompletionPercentage
        }
    };
}
