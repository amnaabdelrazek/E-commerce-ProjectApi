using E_commerce_Project.DTOs;
using E_commerce_Project.Hubs;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace E_commerce_Project.Services.Implementations
{
    public class RealtimeNotifier : IRealtimeNotifier
    {
        private readonly IHubContext<CommerceHub> _hubContext;

        public RealtimeNotifier(IHubContext<CommerceHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyReviewChangedAsync(int productId, string userId, string action, ReviewDto? review = null, int? reviewId = null)
        {
            var payload = new
            {
                action,
                productId,
                reviewId = reviewId ?? review?.Id,
                review
            };

            await _hubContext.Clients.Group(CommerceHubGroups.Product(productId))
                .SendAsync(CommerceHubEvents.ReviewsChanged, payload);

            await _hubContext.Clients.Group(CommerceHubGroups.User(userId))
                .SendAsync(CommerceHubEvents.UserReviewsChanged, payload);
        }

        public Task NotifyCartChangedAsync(string userId, int count)
        {
            return _hubContext.Clients.Group(CommerceHubGroups.User(userId))
                .SendAsync(CommerceHubEvents.CartChanged, new
                {
                    count
                });
        }

        public Task NotifyWishlistChangedAsync(string userId, string action, int? productId = null)
        {
            return _hubContext.Clients.Group(CommerceHubGroups.User(userId))
                .SendAsync(CommerceHubEvents.WishlistChanged, new
                {
                    action,
                    productId
                });
        }

        public async Task NotifyOrderChangedAsync(int orderId, string userId, string status, string action, IEnumerable<string>? sellerUserIds = null)
        {
            var payload = new
            {
                action,
                orderId,
                status
            };

            await _hubContext.Clients.Group(CommerceHubGroups.User(userId))
                .SendAsync(CommerceHubEvents.OrdersChanged, payload);

            if (sellerUserIds == null)
            {
                return;
            }

            foreach (var sellerUserId in sellerUserIds.Where(id => !string.IsNullOrWhiteSpace(id)).Distinct())
            {
                await _hubContext.Clients.Group(CommerceHubGroups.User(sellerUserId))
                    .SendAsync(CommerceHubEvents.OrdersChanged, payload);
            }
        }

        public Task NotifyProductInventoryChangedAsync(int productId, int stockQuantity)
        {
            return _hubContext.Clients.All.SendAsync(CommerceHubEvents.ProductInventoryChanged, new
            {
                productId,
                stockQuantity
            });
        }

        public Task NotifyAdminDashboardChangedAsync(string reason)
        {
            return _hubContext.Clients.Group(CommerceHubGroups.Role("Admin"))
                .SendAsync(CommerceHubEvents.AdminDashboardChanged, new { reason });
        }

        public Task NotifyAdminOrdersChangedAsync(int orderId, string status, string action)
        {
            return _hubContext.Clients.Group(CommerceHubGroups.Role("Admin"))
                .SendAsync(CommerceHubEvents.AdminOrdersChanged, new
                {
                    action,
                    orderId,
                    status
                });
        }

        public Task NotifyAdminCouponsChangedAsync(string action, int? couponId = null)
        {
            return _hubContext.Clients.Group(CommerceHubGroups.Role("Admin"))
                .SendAsync(CommerceHubEvents.AdminCouponsChanged, new
                {
                    action,
                    couponId
                });
        }

        public Task NotifyAdminUsersChangedAsync(string action, string? userId = null)
        {
            return _hubContext.Clients.Group(CommerceHubGroups.Role("Admin"))
                .SendAsync(CommerceHubEvents.AdminUsersChanged, new
                {
                    action,
                    userId
                });
        }

        public Task NotifyAdminSellersChangedAsync(string action, int? sellerId = null, string? sellerUserId = null)
        {
            return _hubContext.Clients.Group(CommerceHubGroups.Role("Admin"))
                .SendAsync(CommerceHubEvents.AdminSellersChanged, new
                {
                    action,
                    sellerId,
                    sellerUserId
                });
        }

        public async Task NotifySellerDashboardChangedAsync(IEnumerable<string> sellerUserIds, string reason)
        {
            foreach (var sellerUserId in sellerUserIds.Where(id => !string.IsNullOrWhiteSpace(id)).Distinct())
            {
                await _hubContext.Clients.Group(CommerceHubGroups.User(sellerUserId))
                    .SendAsync(CommerceHubEvents.SellerDashboardChanged, new
                    {
                        reason
                    });
            }
        }
    }
}
