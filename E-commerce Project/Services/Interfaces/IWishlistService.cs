using E_commerce_Project.DTOs;
using E_commerce_Project.Responses;

namespace E_commerce_Project.Services.Interfaces
{
    public interface IWishlistService
    {
        Task<GeneralResponse<List<WishlistItemDto>>> GetUserWishlistAsync(string userId);
        Task<GeneralResponse<WishlistItemDto>> AddToWishlistAsync(int productId, string userId);
        Task<GeneralResponse<string>> RemoveFromWishlistAsync(int wishlistId, string userId);
        Task<GeneralResponse<string>> RemoveFromWishlistByProductAsync(int productId, string userId);
        Task<GeneralResponse<bool>> IsInWishlistAsync(int productId, string userId);
        Task<GeneralResponse<int>> GetWishlistCountAsync(string userId);
        Task<GeneralResponse<string>> ClearWishlistAsync(string userId);
    }
}