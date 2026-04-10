using E_commerce_Project.DTOs;
using E_commerce_Project.Responses;
using System.Security.Claims;

namespace E_commerce_Project.Services.Interfaces
{

        public interface IAuthService
        {
            Task<GeneralResponse<object>> RegisterAsync(RegisterDto dto);
            Task<GeneralResponse<object>> LoginAsync(LoginDto dto);
            Task<GeneralResponse<string>> ConfirmEmailAsync(string userId, string token);
        }
    
}
