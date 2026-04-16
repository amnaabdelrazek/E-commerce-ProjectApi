using E_commerce_Project.DTOs;
using E_commerce_Project.Responses;

namespace E_commerce_Project.Services.Interfaces
{
    public interface IContentService
    {
        Task<GeneralResponse<List<ContentDto>>> GetAllContentAsync();
        Task<GeneralResponse<ContentDto>> GetContentByIdAsync(int id);
        Task<GeneralResponse<List<ContentDto>>> GetActiveContentAsync(string type);
        Task<GeneralResponse<string>> CreateContentAsync(CreateContentDto dto);
        Task<GeneralResponse<string>> UpdateContentAsync(int id, UpdateContentDto dto);
        Task<GeneralResponse<string>> ToggleContentStatusAsync(int id);
        Task<GeneralResponse<string>> DeleteContentAsync(int id);
        Task<GeneralResponse<string>> UploadContentImageAsync(int contentId, IFormFile image);
    }
}
