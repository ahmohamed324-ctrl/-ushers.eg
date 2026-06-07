using UshersEg.Application.DTOs.Companies;
using UshersEg.Application.DTOs.Jobs;

namespace UshersEg.Application.Interfaces;

public interface ICompanyService
{
    Task<PagedResult<CompanyDto>> GetCompaniesAsync(string? search, int page, int pageSize);
    Task<CompanyDto?> GetCompanyByIdAsync(Guid id);
    Task<CompanyDto?> GetMyCompanyAsync(Guid userId);
    Task<CompanyDto> CreateOrUpdateCompanyAsync(Guid userId, CreateCompanyDto dto);
    Task<string> UploadLogoAsync(Guid userId, Stream fileStream, string fileName);
}
