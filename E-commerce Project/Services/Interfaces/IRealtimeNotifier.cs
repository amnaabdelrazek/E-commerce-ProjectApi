using E_commerce_Project.DTOs;

namespace E_commerce_Project.Services.Interfaces
{
    public interface IRealtimeNotifier
    {
        Task NotifyReviewChangedAsync(int productId, string userId, string action, ReviewDto? review = null, int? reviewId = null);
        Task NotifyCartChangedAsync(string userId, int count);
        Task NotifyWishlistChangedAsync(string userId, string action, int? productId = null);
        Task NotifyOrderChangedAsync(int orderId, string userId, string status, string action, IEnumerable<string>? sellerUserIds = null);
        Task NotifyProductInventoryChangedAsync(int productId, int stockQuantity);
        Task NotifyAdminDashboardChangedAsync(string reason);
        Task NotifyAdminOrdersChangedAsync(int orderId, string status, string action);
        Task NotifyAdminCouponsChangedAsync(string action, int? couponId = null);
        Task NotifyAdminUsersChangedAsync(string action, string? userId = null);
        Task NotifyAdminSellersChangedAsync(string action, int? sellerId = null, string? sellerUserId = null);
        Task NotifySellerDashboardChangedAsync(IEnumerable<string> sellerUserIds, string reason);
    }
}
