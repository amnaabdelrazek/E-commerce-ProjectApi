using E_commerce_Project.Data; // Assuming this contains ApplicationDbContext
using E_commerce_Project.DTOs;
using E_commerce_Project.Models;
using E_commerce_Project.Repositories.Interfaces;
using E_commerce_Project.Responses;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;

namespace E_commerce_Project.Services.Implementations
{
    public class SellerService : ISellerService
    {
        private readonly IGenericRepository<Seller> _repo;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AppDbContext _context; // Add this for direct DB access

        public SellerService(IGenericRepository<Seller> repo,
                              UserManager<ApplicationUser> userManager,
                              AppDbContext context)
        {
            _repo = repo;
            _userManager = userManager;
            _context = context;
        }

        public async Task<SellerProfileDto> GetSellerProfileAsync(string userId)
        {
            var seller = await _repo.Query()
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);
            
            if (seller == null) return null;

            return new SellerProfileDto
            {
                StoreName = seller.StoreName,
                StoreDescription = seller.StoreDescription,
                BusinessAddress = seller.BusinessAddress,
                IsApproved = seller.IsApproved
            };
        }

        public async Task<bool> UpdateSellerProfileAsync(string userId, UpdateSellerProfileDto dto)
        {
            var seller = await _repo.Query()
                .FirstOrDefaultAsync(s => s.UserId == userId);
            
            if (seller == null) return false;

            if (!string.IsNullOrWhiteSpace(dto.StoreName)) 
                seller.StoreName = dto.StoreName;
            
            if (!string.IsNullOrWhiteSpace(dto.StoreDescription)) 
                seller.StoreDescription = dto.StoreDescription;
            
            if (!string.IsNullOrWhiteSpace(dto.BusinessAddress)) 
                seller.BusinessAddress = dto.BusinessAddress;

            _repo.Update(seller);
            //suggest solutionsfor this line 
            // var result = await _repo.SaveAsync();
            // return result > 0;

            await _repo.SaveAsync();
            return true;
        }

        public async Task<GeneralResponse<SellerDashboardDto>> GetDashboardStatsAsync(ClaimsPrincipal userPrincipal)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);
            if (user == null)
                return GeneralResponse<SellerDashboardDto>.Fail("User not found");

            // ✅ CHECK APPROVAL
            var seller = await _context.Sellers
                .FirstOrDefaultAsync(s => s.UserId == user.Id);

            if (seller == null || !seller.IsApproved)
                return GeneralResponse<SellerDashboardDto>.Fail("Your account is pending approval");

            var totalEarnings = await _context.OrderItems
                .Where(oi => oi.Product.SellerId.ToString() == user.Id)
                .SumAsync(oi => (decimal?)(oi.Price * oi.Quantity)) ?? 0;

            var totalProducts = await _context.Products
                .CountAsync(p => p.SellerId.ToString() == user.Id);

            var outOfStock = await _context.Products
                .CountAsync(p => p.SellerId.ToString() == user.Id && p.StockQuantity == 0);

            var stats = new SellerDashboardDto
            {
                TotalEarnings = totalEarnings,
                TotalProducts = totalProducts,
                OutOfStockCount = outOfStock,
                PendingOrdersCount = 0
            };

            return GeneralResponse<SellerDashboardDto>.Success(stats);
        }
    }
}
