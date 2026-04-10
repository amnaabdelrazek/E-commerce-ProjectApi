using E_commerce_Project.DTOs;
using E_commerce_Project.Responses;
using System.Security.Claims;

namespace E_commerce_Project.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<GeneralResponse<string>> CreateAsync(CreateCategoryDto dto);
        Task<GeneralResponse<string>> UpdateAsync(int id, UpdateCategoryDto dto);
        Task<GeneralResponse<string>> DeleteAsync(int id);
        Task<GeneralResponse<object>> GetAllAsync(CategoryFilterDto filter);
        Task<GeneralResponse<object>> GetByIdAsync(int id);

        Task<GeneralResponse<string>> UploadImageAsync(int id, IFormFile file);
    }
}