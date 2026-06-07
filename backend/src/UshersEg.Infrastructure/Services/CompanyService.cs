using Microsoft.EntityFrameworkCore;
using UshersEg.Application.DTOs.Companies;
using UshersEg.Application.DTOs.Jobs;
using UshersEg.Application.Interfaces;
using UshersEg.Domain.Entities;
using UshersEg.Infrastructure.Data;
using Microsoft.Extensions.Configuration;

namespace UshersEg.Infrastructure.Services;

public class CompanyService : ICompanyService
{
    private readonly ApplicationDbContext _db;
    private readonly string _uploadPath;

    public CompanyService(ApplicationDbContext db, IConfiguration config)
    {
        _db = db;
        _uploadPath = config["UploadPath"] ?? "Uploads";
    }

    public async Task<PagedResult<CompanyDto>> GetCompaniesAsync(string? search, int page, int pageSize)
    {
        var q = _db.Companies.Include(c => c.Jobs).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            q = q.Where(c => c.Name.ToLower().Contains(s) ||
                             (c.Industry != null && c.Industry.ToLower().Contains(s)) ||
                             (c.Location != null && c.Location.ToLower().Contains(s)));
        }

        q = q.OrderByDescending(c => c.IsFeatured).ThenByDescending(c => c.CreatedAt);

        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PagedResult<CompanyDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<CompanyDto?> GetCompanyByIdAsync(Guid id)
    {
        var company = await _db.Companies.Include(c => c.Jobs).FirstOrDefaultAsync(c => c.Id == id);
        return company is null ? null : MapToDto(company);
    }

    public async Task<CompanyDto?> GetMyCompanyAsync(Guid userId)
    {
        var company = await _db.Companies.Include(c => c.Jobs).FirstOrDefaultAsync(c => c.UserId == userId);
        return company is null ? null : MapToDto(company);
    }

    public async Task<CompanyDto> CreateOrUpdateCompanyAsync(Guid userId, CreateCompanyDto dto)
    {
        var company = await _db.Companies.FirstOrDefaultAsync(c => c.UserId == userId);
        if (company is null)
        {
            company = new Company { UserId = userId };
            _db.Companies.Add(company);
        }

        company.Name = dto.Name;
        company.Description = dto.Description;
        company.Industry = dto.Industry;
        company.Location = dto.Location;
        company.Website = dto.Website;
        company.Phone = dto.Phone;
        company.Email = dto.Email;
        company.Founded = dto.Founded;
        company.Size = dto.Size;

        await _db.SaveChangesAsync();
        return (await GetCompanyByIdAsync(company.Id))!;
    }

    public async Task<string> UploadLogoAsync(Guid userId, Stream fileStream, string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLower();
        var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp", ".svg" };
        if (!allowed.Contains(ext)) throw new InvalidOperationException("Invalid file type.");

        var company = await _db.Companies.FirstOrDefaultAsync(c => c.UserId == userId);
        if (company is null)
        {
            company = new Company { UserId = userId, Name = "My Company" };
            _db.Companies.Add(company);
            await _db.SaveChangesAsync();
        }

        var dir = Path.Combine(_uploadPath, "logos");
        Directory.CreateDirectory(dir);
        var newName = $"{company.Id}{ext}";
        var fullPath = Path.Combine(dir, newName);

        using var fs = new FileStream(fullPath, FileMode.Create);
        await fileStream.CopyToAsync(fs);

        var url = $"/uploads/logos/{newName}";
        company.LogoUrl = url;
        await _db.SaveChangesAsync();
        return url;
    }

    private static CompanyDto MapToDto(Company c) => new()
    {
        Id = c.Id,
        UserId = c.UserId,
        Name = c.Name,
        LogoUrl = c.LogoUrl,
        Description = c.Description,
        Industry = c.Industry,
        Location = c.Location,
        Website = c.Website,
        Phone = c.Phone,
        Email = c.Email,
        Founded = c.Founded,
        Size = c.Size,
        IsVerified = c.IsVerified,
        IsFeatured = c.IsFeatured,
        TotalJobs = c.Jobs?.Count ?? 0,
        ActiveJobs = c.Jobs?.Count(j => j.Status == Domain.Enums.JobStatus.Active) ?? 0,
        CreatedAt = c.CreatedAt
    };
}
