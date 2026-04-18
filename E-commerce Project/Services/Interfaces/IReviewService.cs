using E_commerce_Project.DTOs;
using E_commerce_Project.Responses;

namespace E_commerce_Project.Services.Interfaces
{
    public interface IReviewService
    {
        Task<GeneralResponse<List<ReviewDto>>> GetUserReviewsAsync(string userId);
        Task<GeneralResponse<List<ReviewDto>>> GetProductReviewsAsync(int productId);
        Task<GeneralResponse<ReviewDto>> CreateReviewAsync(CreateReviewDto dto, string userId);
        Task<GeneralResponse<ReviewDto>> UpdateReviewAsync(int reviewId, UpdateReviewDto dto, string userId);
        Task<GeneralResponse<string>> DeleteReviewAsync(int reviewId, string userId);
        Task<GeneralResponse<bool>> HasUserReviewedAsync(int productId, string userId);
    }
}