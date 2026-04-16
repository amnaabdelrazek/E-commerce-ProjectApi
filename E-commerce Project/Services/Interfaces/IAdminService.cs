using E_commerce_Project.DTOs;
using E_commerce_Project.Models;
using E_commerce_Project.Responses;

namespace E_commerce_Project.Services.Interfaces
{
    public interface IAdminService
    {
        Task<GeneralResponse<string>> CreateCouponAsync(CreateCouponDto dto);
        Task<IEnumerable<Coupon>> GetAllCouponsAsync();
        Task<GeneralResponse<string>> DeleteCouponAsync(int id);
        Task<IEnumerable<AdminUserDto>> GetAllUsersAsync();
        Task<GeneralResponse<string>> LockUserAsync(string userId);
        Task<GeneralResponse<string>> UnlockUserAsync(string userId);
        Task<GeneralResponse<string>> SoftDeleteUserAsync(string userId);
        Task<GeneralResponse<string>> ChangeUserRoleAsync(string userId, string newRole);
        Task<AdminDashboardDto> GetDashboardAsync();
        Task<IEnumerable<Order>> GetAllOrdersAsync();
    }
}
