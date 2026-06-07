using UshersEg.Domain.Entities;

namespace UshersEg.Application.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    (bool isValid, Guid userId) ValidateRefreshToken(string refreshToken);
}
