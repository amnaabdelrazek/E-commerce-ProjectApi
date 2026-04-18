using E_commerce_Project.Data;
using E_commerce_Project.DTOs;
using E_commerce_Project.Models;
using E_commerce_Project.Responses;
using E_commerce_Project.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace E_commerce_Project.Services.Implementations
{
    public class WishlistService : IWishlistService
    {
        private readonly AppDbContext _context;

        public WishlistService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<GeneralResponse<List<WishlistItemDto>>> GetUserWishlistAsync(string userId)
        {
            try
            {
                var wishlistItems = await _context.Wishlists
                    .Where(w => w.UserId == userId && !w.IsDeleted)
                    .Include(w => w.Product)
                    .ThenInclude(p => p.Category)
                    .Include(w => w.Product)
                    .ThenInclude(p => p.Reviews)
                    .Select(w => new WishlistItemDto
                    {
                        Id = w.Id,
                        ProductId = w.ProductId,
                        ProductName = w.Product.Name,
                        ProductPrice = w.Product.Price,
                        ProductImageUrl = w.Product.ImageUrl,
                        CategoryName = w.Product.Category.Name,
                        Rating = w.Product.Reviews.Any() 
                            ? Math.Round((decimal)w.Product.Reviews.Average(r => r.Rating), 2)
                            : null,
                        AddedDate = w.CreatedAt
                    })
                    .OrderByDescending(w => w.AddedDate)
                    .ToListAsync();

                return GeneralResponse<List<WishlistItemDto>>.Success(wishlistItems);
            }
            catch (Exception ex)
            {
                return GeneralResponse<List<WishlistItemDto>>.Fail($"Error getting wishlist: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<WishlistItemDto>> AddToWishlistAsync(int productId, string userId)
        {
            try
            {
                // Validate product exists
                var product = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Reviews)
                    .FirstOrDefaultAsync(p => p.Id == productId && !p.IsDeleted);

                if (product == null)
                    return GeneralResponse<WishlistItemDto>.Fail("Product not found");

                // Check if product already in wishlist
                var existingWishlistItem = await _context.Wishlists
                    .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId && !w.IsDeleted);

                if (existingWishlistItem != null)
                    return GeneralResponse<WishlistItemDto>.Fail("Product is already in your wishlist");

                // Add to wishlist
                var wishlistItem = new Wishlist
                {
                    UserId = userId,
                    ProductId = productId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Wishlists.Add(wishlistItem);
                await _context.SaveChangesAsync();

                // Map to DTO
                var wishlistItemDto = new WishlistItemDto
                {
                    Id = wishlistItem.Id,
                    ProductId = product.Id,
                    ProductName = product.Name,
                    ProductPrice = product.Price,
                    ProductImageUrl = product.ImageUrl,
                    CategoryName = product.Category?.Name,
                    Rating = product.Reviews.Any()
                        ? Math.Round((decimal)product.Reviews.Average(r => r.Rating), 2)
                        : null,
                    AddedDate = wishlistItem.CreatedAt
                };

                return GeneralResponse<WishlistItemDto>.Success(wishlistItemDto, "Product added to wishlist successfully");
            }
            catch (Exception ex)
            {
                return GeneralResponse<WishlistItemDto>.Fail($"Error adding to wishlist: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<string>> RemoveFromWishlistAsync(int wishlistId, string userId)
        {
            try
            {
                var wishlistItem = await _context.Wishlists
                    .FirstOrDefaultAsync(w => w.Id == wishlistId && w.UserId == userId && !w.IsDeleted);

                if (wishlistItem == null)
                    return GeneralResponse<string>.Fail("Wishlist item not found");

                // Soft delete
                wishlistItem.IsDeleted = true;
                wishlistItem.LastModifiedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return GeneralResponse<string>.Success("Product removed from wishlist successfully");
            }
            catch (Exception ex)
            {
                return GeneralResponse<string>.Fail($"Error removing from wishlist: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<string>> RemoveFromWishlistByProductAsync(int productId, string userId)
        {
            try
            {
                var wishlistItem = await _context.Wishlists
                    .FirstOrDefaultAsync(w => w.ProductId == productId && w.UserId == userId && !w.IsDeleted);

                if (wishlistItem == null)
                    return GeneralResponse<string>.Fail("Product not found in wishlist");

                // Soft delete
                wishlistItem.IsDeleted = true;
                wishlistItem.LastModifiedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return GeneralResponse<string>.Success("Product removed from wishlist successfully");
            }
            catch (Exception ex)
            {
                return GeneralResponse<string>.Fail($"Error removing from wishlist: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<bool>> IsInWishlistAsync(int productId, string userId)
        {
            try
            {
                var isInWishlist = await _context.Wishlists
                    .AnyAsync(w => w.UserId == userId && w.ProductId == productId && !w.IsDeleted);

                return GeneralResponse<bool>.Success(isInWishlist);
            }
            catch (Exception ex)
            {
                return GeneralResponse<bool>.Fail($"Error checking wishlist: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<int>> GetWishlistCountAsync(string userId)
        {
            try
            {
                var count = await _context.Wishlists
                    .CountAsync(w => w.UserId == userId && !w.IsDeleted);

                return GeneralResponse<int>.Success(count);
            }
            catch (Exception ex)
            {
                return GeneralResponse<int>.Fail($"Error getting wishlist count: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<string>> ClearWishlistAsync(string userId)
        {
            try
            {
                var wishlistItems = await _context.Wishlists
                    .Where(w => w.UserId == userId && !w.IsDeleted)
                    .ToListAsync();

                foreach (var item in wishlistItems)
                {
                    item.IsDeleted = true;
                    item.LastModifiedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return GeneralResponse<string>.Success("Wishlist cleared successfully");
            }
            catch (Exception ex)
            {
                return GeneralResponse<string>.Fail($"Error clearing wishlist: {ex.Message}");
            }
        }
    }
}
