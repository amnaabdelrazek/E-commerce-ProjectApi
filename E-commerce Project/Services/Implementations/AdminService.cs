using E_commerce_Project.Data;
using E_commerce_Project.DTOs;
using E_commerce_Project.Models;
using E_commerce_Project.Responses;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace E_commerce_Project.Services.Implementations
{
    public class AdminService : IAdminService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly AppDbContext _context;

        public AdminService(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            AppDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }

        public async Task<IEnumerable<AdminUserDto>> GetAllUsersAsync()
        {
            // Include soft-deleted users for admin visibility.
            var users = await _context.Users
                .IgnoreQueryFilters()
                .ToListAsync();
            var result = new List<AdminUserDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);

                result.Add(new AdminUserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = roles.FirstOrDefault() ?? string.Empty,
                    IsLocked = user.LockoutEnd != null && user.LockoutEnd > DateTimeOffset.UtcNow,
                    IsDeleted = user.IsDeleted
                });
            }

            return result;
        }

        public async Task<GeneralResponse<string>> LockUserAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return GeneralResponse<string>.Fail("User id is required");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return GeneralResponse<string>.Fail("User not found");

            user.LockoutEnabled = true;
            user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100);

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return GeneralResponse<string>.Fail(FormatIdentityErrors(updateResult));

            return GeneralResponse<string>.Success(string.Empty, "User locked");
        }

        public async Task<GeneralResponse<string>> UnlockUserAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return GeneralResponse<string>.Fail("User id is required");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return GeneralResponse<string>.Fail("User not found");

            user.LockoutEnd = null;

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return GeneralResponse<string>.Fail(FormatIdentityErrors(updateResult));

            return GeneralResponse<string>.Success(string.Empty, "User unlocked");
        }

        public async Task<GeneralResponse<string>> SoftDeleteUserAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return GeneralResponse<string>.Fail("User id is required");

            // Use IgnoreQueryFilters() so we can soft-delete even if it's already deleted.
            var user = await _context.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return GeneralResponse<string>.Fail("User not found");

            user.IsDeleted = true;
            user.DeletedAt = DateTime.UtcNow;

            // Ensure the user cannot sign in.
            user.LockoutEnabled = true;
            user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100);

            await _context.SaveChangesAsync();

            return GeneralResponse<string>.Success(string.Empty, "User deleted");
        }

        public async Task<GeneralResponse<string>> ChangeUserRoleAsync(string userId, string newRole)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return GeneralResponse<string>.Fail("User id is required");

            if (string.IsNullOrWhiteSpace(newRole))
                return GeneralResponse<string>.Fail("New role is required");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return GeneralResponse<string>.Fail("User not found");

            if (!await _roleManager.RoleExistsAsync(newRole))
                return GeneralResponse<string>.Fail("Role does not exist");

            var currentRoles = await _userManager.GetRolesAsync(user);
            if (currentRoles.Contains(newRole))
                return GeneralResponse<string>.Success(string.Empty, "User already has this role");

            if (currentRoles.Any())
            {
                var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
                if (!removeResult.Succeeded)
                    return GeneralResponse<string>.Fail(FormatIdentityErrors(removeResult));
            }

            var addResult = await _userManager.AddToRoleAsync(user, newRole);
            if (!addResult.Succeeded)
            {
                if (currentRoles.Any())
                    await _userManager.AddToRolesAsync(user, currentRoles);

                return GeneralResponse<string>.Fail(FormatIdentityErrors(addResult));
            }

            return GeneralResponse<string>.Success(string.Empty, "Role updated");
        }

        public async Task<GeneralResponse<string>> CreateCouponAsync(CreateCouponDto dto)
        {
            if (dto == null)
                return GeneralResponse<string>.Fail("Coupon payload is required");

            if (string.IsNullOrWhiteSpace(dto.Code))
                return GeneralResponse<string>.Fail("Coupon code is required");

            if (dto.ExpiryDate <= DateTime.UtcNow)
                return GeneralResponse<string>.Fail("Expiry date must be in the future");

            var hasPercentageDiscount = dto.DiscountPercentage.HasValue;
            var hasAmountDiscount = dto.DiscountAmount > 0;
            if (hasPercentageDiscount == hasAmountDiscount)
                return GeneralResponse<string>.Fail(
                    "Provide either a percentage discount or a fixed amount discount");

            if (hasPercentageDiscount && (dto.DiscountPercentage < 0 || dto.DiscountPercentage > 100))
                return GeneralResponse<string>.Fail("Discount percentage must be between 0 and 100");

            var normalizedCode = dto.Code.Trim().ToUpperInvariant();
            var codeExists = await _context.Coupons.AnyAsync(c => c.Code.ToUpper() == normalizedCode);
            if (codeExists)
                return GeneralResponse<string>.Fail("Coupon code already exists");

            var coupon = new Coupon
            {
                Code = normalizedCode,
                DiscountAmount = dto.DiscountAmount,
                DiscountPercentage = dto.DiscountPercentage,
                ExpiryDate = dto.ExpiryDate,
                IsActive = true
            };

            _context.Coupons.Add(coupon);
            await _context.SaveChangesAsync();

            return GeneralResponse<string>.Success(string.Empty, "Coupon created");
        }

        public async Task<IEnumerable<Coupon>> GetAllCouponsAsync()
        {
            return await _context.Coupons.ToListAsync();
        }

        public async Task<GeneralResponse<string>> DeleteCouponAsync(int id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null)
                return GeneralResponse<string>.Fail("Coupon not found");

            coupon.IsDeleted = true;
            coupon.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return GeneralResponse<string>.Success(string.Empty, "Deleted");
        }

        public async Task<AdminDashboardDto> GetDashboardAsync()
        {
            return new AdminDashboardDto
            {
                TotalUsers = await _userManager.Users.CountAsync(),
                TotalOrders = await _context.Orders.CountAsync(),
                TotalProducts = await _context.Products.CountAsync(),
                TotalRevenue = await _context.Orders.SumAsync(o => o.TotalPrice)
            };
        }

        public async Task<IEnumerable<Order>> GetAllOrdersAsync()
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .ToListAsync();
        }

        private static string FormatIdentityErrors(IdentityResult result)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            return errors.Count == 0 ? "Identity operation failed" : string.Join("; ", errors);
        }
    }
}
