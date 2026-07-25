using E_commerce_Project.Data;
using E_commerce_Project.DTOs;
using E_commerce_Project.DTOs.Admin;
using E_commerce_Project.Models;
using E_commerce_Project.Responses;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using static E_commerce_Project.DTOs.SellerApprovalDtos;

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

        // ==================== USER MANAGEMENT ====================

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

        // ==================== COUPON MANAGEMENT ====================

        public async Task<GeneralResponse<string>> CreateCouponAsync(CreateCouponDto dto)
        {
            if (dto == null)
                return GeneralResponse<string>.Fail("Coupon payload is required");

            if (string.IsNullOrWhiteSpace(dto.Code))
                return GeneralResponse<string>.Fail("Coupon code is required");
            if (dto.MinimumPurchaseAmount < 0)
                return GeneralResponse<string>.Fail("Minimum purchase amount must be 0 or greater");

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
                MinimumPurchaseAmount = dto.MinimumPurchaseAmount,
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

        // ==================== ORDER MANAGEMENT ====================

        public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Include(o => o.User)
                .ToListAsync();

            return orders.Select(o => new OrderDto
            {
                Id = o.Id,
                UserFullName = o.User.FullName,
                UserId = o.UserId,
                Status = o.Status,
                SubTotal = o.SubTotal,
                TotalPrice = o.TotalPrice,
                DiscountAmount = o.DiscountAmount,
                PromoCode = o.AppliedPromoCode,
                TaxAmount = o.TaxAmount,
                ShippingCost = o.ShippingCost,
                PaymentMethod = o.PaymentMethod,
                CreatedAt = o.CreatedAt,
                DeliveryAddress = o.DeliveryAddress,
                Email = o.Email,
                PhoneNumber = o.PhoneNumber,
                Notes = o.Notes,
                Items = o.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.Name ?? string.Empty,
                    PriceAtPurchase = oi.PriceAtPurchase > 0 ? oi.PriceAtPurchase : (oi.Product?.Price ?? 0),
                    Quantity = oi.Quantity,
                }).ToList()
            }).ToList();
        }

        // ==================== SELLER APPROVAL MANAGEMENT ====================

        /// <summary>
        /// Get all pending sellers waiting for admin approval
        /// </summary>
        public async Task<IEnumerable<PendingSellerDto>> GetPendingSellersAsync()
        {
            var pendingSellers = await _context.Sellers
                .Include(s => s.User)
                .Where(s => !s.IsApproved)
                .Select(s => new PendingSellerDto
                {
                    Id = s.id,
                    UserId = s.UserId,
                    UserEmail = s.User.Email,
                    UserFullName = s.User.FullName,
                    StoreName = s.StoreName,
                    StoreDescription = s.StoreDescription,
                    BusinessAddress = s.BusinessAddress,
                    IsApproved = s.IsApproved,
                    CreatedAt = s.CreatedAt
                })
                .OrderBy(s => s.CreatedAt)
                .ToListAsync();

            return pendingSellers;
        }

        /// <summary>
        /// Get all sellers (both approved and pending)
        /// </summary>
        public async Task<IEnumerable<SellerApprovalStatusDto>> GetAllSellersAsync()
        {
            var sellers = await _context.Sellers
                .Include(s => s.User)
                .Select(s => new SellerApprovalStatusDto
                {
                    SellerId = s.id,
                    StoreName = s.StoreName,
                    UserEmail = s.User.Email,
                    IsApproved = s.IsApproved
                })
                .OrderBy(s => s.IsApproved)
                .ThenBy(s => s.StoreName)
                .ToListAsync();

            return sellers;
        }

        /// <summary>
        /// Approve or reject a seller account
        /// </summary>
        public async Task<GeneralResponse<string>> ApproveSellersAsync(int sellerId, bool isApproved)
        {
            var seller = await _context.Sellers
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.id == sellerId);

            if (seller == null)
                return GeneralResponse<string>.Fail("Seller not found");

            seller.IsApproved = isApproved;

            if (isApproved)
            {
                // ✔ NOW assign role here ONLY
                if (!await _userManager.IsInRoleAsync(seller.User, "Seller"))
                {
                    await _userManager.AddToRoleAsync(seller.User, "Seller");
                }
            }
            else
            {
                // optional cleanup
                if (await _userManager.IsInRoleAsync(seller.User, "Seller"))
                {
                    await _userManager.RemoveFromRoleAsync(seller.User, "Seller");
                }
            }

            await _context.SaveChangesAsync();

            return GeneralResponse<string>.Success(
                string.Empty,
                isApproved ? "Seller approved" : "Seller rejected"
            );
        }
        /// <summary>
        /// Get seller details by ID
        /// </summary>
        public async Task<PendingSellerDto> GetSellerDetailsAsync(int sellerId)
        {
            var seller = await _context.Sellers
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.id == sellerId);

            if (seller == null)
                return null;

            return new PendingSellerDto
            {
                Id = seller.id,
                UserId = seller.UserId,
                UserEmail = seller.User.Email,
                UserFullName = seller.User.FullName,
                StoreName = seller.StoreName,
                StoreDescription = seller.StoreDescription,
                BusinessAddress = seller.BusinessAddress,
                IsApproved = seller.IsApproved,
                CreatedAt = seller.CreatedAt
            };
        }

        // ==================== DASHBOARD ====================

        public async Task<AdminDashboardDto> GetDashboardAsync()
        {
            var orders = await _context.Orders.ToListAsync();
            var coupons = await _context.Coupons.CountAsync(c => !c.IsDeleted);

            var topBuyers = await _context.Orders
                .Include(o => o.User)
                .GroupBy(o => o.UserId)
                .Select(g => new TopBuyerDto
                {
                    Name = g.First().User.FullName ?? g.First().User.Email ?? "Unknown",
                    Spent = g.Sum(x => x.TotalPrice)
                })
                .OrderByDescending(x => x.Spent)
                .Take(5)
                .ToListAsync();

            return new AdminDashboardDto
            {
                TotalUsers = await _userManager.Users.CountAsync(),
                TotalOrders = orders.Count,
                TotalProducts = await _context.Products.CountAsync(),
                TotalRevenue = orders.Sum(o => o.TotalPrice),
                TotalCoupons = coupons,
                PendingOrders = orders.Count(o => o.Status == "Pending"),
                ActiveUsers = await _userManager.Users.CountAsync(u => !u.IsDeleted),

                MonthlyRevenue = orders
                    .GroupBy(o => o.CreatedAt.Month)
                    .Select(g => new MonthlyRevenueDto
                    {
                        Month = g.Key.ToString(),
                        Revenue = g.Sum(x => x.TotalPrice)
                    }).ToList(),

                TopProducts = await _context.OrderItems
                    .Include(oi => oi.Product)
                    .GroupBy(oi => oi.Product.Name)
                    .Select(g => new TopProductDto
                    {
                        ProductName = g.Key,
                        Sales = g.Sum(x => x.Quantity)
                    })
                    .OrderByDescending(x => x.Sales)
                    .Take(10)
                    .ToListAsync(),

                TopBuyers = topBuyers
            };
        }

        // ==================== HELPER METHODS ====================

        private static string FormatIdentityErrors(IdentityResult result)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            return errors.Count == 0 ? "Identity operation failed" : string.Join("; ", errors);
        }
    }
}