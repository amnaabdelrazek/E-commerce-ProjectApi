using E_commerce_Project.DTOs;
using E_commerce_Project.DTOs.Admin;
using E_commerce_Project.Models;
using E_commerce_Project.Responses;
using static E_commerce_Project.DTOs.SellerApprovalDtos;

namespace E_commerce_Project.Services.Interfaces
{
    public interface IAdminService
    {
        // User Management
        Task<IEnumerable<AdminUserDto>> GetAllUsersAsync();
        Task<GeneralResponse<string>> LockUserAsync(string userId);
        Task<GeneralResponse<string>> UnlockUserAsync(string userId);
        Task<GeneralResponse<string>> SoftDeleteUserAsync(string userId);
        Task<GeneralResponse<string>> ChangeUserRoleAsync(string userId, string newRole);

        // Coupon Management
        Task<GeneralResponse<string>> CreateCouponAsync(CreateCouponDto dto);
        Task<IEnumerable<Coupon>> GetAllCouponsAsync();
        Task<GeneralResponse<string>> DeleteCouponAsync(int id);

        // Order Management
        Task<IEnumerable<OrderDto>> GetAllOrdersAsync();

        // Seller Approval Management
        /// <summary>
        /// Get all pending sellers waiting for admin approval
        /// </summary>
        Task<IEnumerable<PendingSellerDto>> GetPendingSellersAsync();

        /// <summary>
        /// Get all sellers (both approved and pending)
        /// </summary>
        Task<IEnumerable<SellerApprovalStatusDto>> GetAllSellersAsync();

        /// <summary>
        /// Approve or reject a seller account
        /// </summary>
        Task<GeneralResponse<string>> ApproveSellersAsync(int sellerId, bool isApproved);

        /// <summary>
        /// Get seller details by ID
        /// </summary>
        Task<PendingSellerDto> GetSellerDetailsAsync(int sellerId);

        // Dashboard
        Task<AdminDashboardDto> GetDashboardAsync();
    }
}