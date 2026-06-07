using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UshersEg.Application.Common;
using UshersEg.Application.DTOs.Companies;
using UshersEg.Application.DTOs.Jobs;
using UshersEg.Application.Interfaces;

namespace UshersEg.API.Controllers;

[ApiController]
[Route("api/v1/companies")]
public class CompaniesController : ControllerBase
{
    private readonly ICompanyService _companies;

    public CompaniesController(ICompanyService companies) => _companies = companies;

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<CompanyDto>>>> GetCompanies([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 12)
    {
        var result = await _companies.GetCompaniesAsync(search, page, pageSize);
        return Ok(ApiResponse<PagedResult<CompanyDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CompanyDto>>> GetCompany(Guid id)
    {
        var company = await _companies.GetCompanyByIdAsync(id);
        if (company is null) return NotFound(ApiResponse<CompanyDto>.Fail("Company not found."));
        return Ok(ApiResponse<CompanyDto>.Ok(company));
    }

    [Authorize(Roles = "Employer")]
    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<CompanyDto>>> GetMyCompany()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var company = await _companies.GetMyCompanyAsync(userId);
        if (company is null) return NotFound(ApiResponse<CompanyDto>.Fail("No company profile found."));
        return Ok(ApiResponse<CompanyDto>.Ok(company));
    }

    [Authorize(Roles = "Employer")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<CompanyDto>>> CreateOrUpdate(CreateCompanyDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await _companies.CreateOrUpdateCompanyAsync(userId, dto);
        return Ok(ApiResponse<CompanyDto>.Ok(result, "Company profile saved."));
    }

    [Authorize(Roles = "Employer")]
    [HttpPost("upload-logo")]
    public async Task<ActionResult<ApiResponse<string>>> UploadLogo(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<string>.Fail("No file uploaded."));
        if (file.Length > 3 * 1024 * 1024)
            return BadRequest(ApiResponse<string>.Fail("File must be under 3MB."));

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        using var stream = file.OpenReadStream();
        var url = await _companies.UploadLogoAsync(userId, stream, file.FileName);
        return Ok(ApiResponse<string>.Ok(url, "Logo uploaded."));
    }
}
