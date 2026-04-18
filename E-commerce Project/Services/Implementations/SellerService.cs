using E_commerce_Project.Data; // Assuming this contains ApplicationDbContext
using E_commerce_Project.DTOs;
using E_commerce_Project.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace E_commerce_Project.Services.Implementations
{
    public class SellerService : ISellerService
    {
        // Make sure this matches your DB Context name (ApplicationDbContext or AppDbContext)
        private readonly AppDbContext _context;

        public SellerService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<SellerProfileDto> GetSellerProfileAsync(string userId)
        {
            var seller = await _context.Sellers.FirstOrDefaultAsync(s => s.UserId == userId);
            
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
            var seller = await _context.Sellers.FirstOrDefaultAsync(s => s.UserId == userId);
            
            if (seller == null) return false;

            if (!string.IsNullOrWhiteSpace(dto.StoreName)) 
                seller.StoreName = dto.StoreName;
            
            if (!string.IsNullOrWhiteSpace(dto.StoreDescription)) 
                seller.StoreDescription = dto.StoreDescription;
            
            if (!string.IsNullOrWhiteSpace(dto.BusinessAddress)) 
                seller.BusinessAddress = dto.BusinessAddress;

            _context.Sellers.Update(seller);
            var result = await _context.SaveChangesAsync();

            return result > 0;
        }
    }
}
