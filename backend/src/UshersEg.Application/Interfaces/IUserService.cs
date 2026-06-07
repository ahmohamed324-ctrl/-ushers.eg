using UshersEg.Application.DTOs.Users;

namespace UshersEg.Application.Interfaces;

public interface IUserService
{
    Task<UserProfileDto?> GetProfileAsync(Guid userId);
    Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
    Task<string> UploadAvatarAsync(Guid userId, Stream fileStream, string fileName);
    Task<string> UploadCvAsync(Guid userId, Stream fileStream, string fileName);
    Task<string> UploadFormalPhotoAsync(Guid userId, Stream fileStream, string fileName);
    Task<string> UploadCasualPhotoAsync(Guid userId, Stream fileStream, string fileName);
    Task<UserProfileDto> UpdateUsherProfileAsync(Guid userId, UpdateUsherProfileDto dto);
    Task<bool> ToggleActiveAsync(Guid adminId, Guid userId);
}
