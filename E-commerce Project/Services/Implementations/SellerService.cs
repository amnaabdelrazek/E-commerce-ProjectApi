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
            
            bool isNew = false;
            if (seller == null) 
            {
                seller = new Seller { UserId = userId, IsApproved = false, Balance = 0 };
                isNew = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.StoreName)) 
                seller.StoreName = dto.StoreName;
            
            if (!string.IsNullOrWhiteSpace(dto.StoreDescription)) 
                seller.StoreDescription = dto.StoreDescription;
            
            if (!string.IsNullOrWhiteSpace(dto.BusinessAddress)) 
                seller.BusinessAddress = dto.BusinessAddress;

            if (isNew)
            {
                await _repo.AddAsync(seller);
            }
            else
            {
                _repo.Update(seller);
            }

            await _repo.SaveAsync();
            return true;
        }

        public async Task<GeneralResponse<SellerDashboardDto>> GetDashboardStatsAsync(ClaimsPrincipal userPrincipal)
        {
            // 1. Get the Current User
            var user = await _userManager.GetUserAsync(userPrincipal);
            if (user == null) return GeneralResponse<SellerDashboardDto>.Fail("User not found");

            // 2. Find the Seller record associated with this User
            var seller = await _context.Sellers.FirstOrDefaultAsync(s => s.UserId == user.Id);

            // 3. IF NO DATA / SELLER DOES NOT EXIST YET: Return ZEROS
            if (seller == null)
            {
                var emptyStats = new SellerDashboardDto
                {
                    TotalEarnings = 10,
                    TotalProducts = 1,
                    OutOfStockCount = 1,
                    PendingOrdersCount = 1
                };
                return GeneralResponse<SellerDashboardDto>.Success(emptyStats, "No store data found.");
            }

            // 4. Calculate stats using the actual Seller ID (much safer than user.Id)
            var totalEarnings = await _context.OrderItems
                .Where(oi => oi.Product.SellerId == seller.id)
                .SumAsync(oi => (decimal?)(oi.Price * oi.Quantity)) ?? 0; // "?? 0" enforces 0 if null

            var totalProducts = await _context.Products
                .CountAsync(p => p.SellerId == seller.id);

            var outOfStock = await _context.Products
                .CountAsync(p => p.SellerId == seller.id && p.StockQuantity == 0);

            // 5. Combine into DTO
            var stats = new SellerDashboardDto
            {
                TotalEarnings = totalEarnings,
                TotalProducts = totalProducts,
                OutOfStockCount = outOfStock,
                PendingOrdersCount = 0 // Link to Orders table later
            };

            return GeneralResponse<SellerDashboardDto>.Success(stats);
        }
    }
}
