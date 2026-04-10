using E_commerce_Project.DTOs;
using E_commerce_Project.Responses;
using System.Security.Claims;

namespace E_commerce_Project.Services.Interfaces
{
    public interface IUserService
    {
        Task<GeneralResponse<object>> GetProfileAsync(ClaimsPrincipal user);
        Task<GeneralResponse<string>> UpdateProfileAsync(ClaimsPrincipal user, UpdateProfileDto dto);
        Task<GeneralResponse<string>> UploadImageAsync(ClaimsPrincipal user, IFormFile file);
        Task<GeneralResponse<string>> ChangePasswordAsync(ClaimsPrincipal user, ChangePasswordDto dto);
    }
}
