using E_commerce_Project.Data;
using E_commerce_Project.DTOs;
using E_commerce_Project.Models;
using E_commerce_Project.Responses;
using E_commerce_Project.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace E_commerce_Project.Services.Implementations
{

    public class ReviewService : IReviewService
    {
        private readonly AppDbContext _context;

        public ReviewService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<GeneralResponse<List<ReviewDto>>> GetUserReviewsAsync(string userId)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Where(r => r.UserId == userId && !r.IsDeleted)
                    .Include(r => r.Product)
                    .Include(r => r.User)
                    .Select(r => new ReviewDto
                    {
                        Id = r.Id,
                        ProductId = r.ProductId,
                        ProductName = r.Product.Name,
                        UserName = r.User.UserName ?? "Anonymous",
                        Rating = r.Rating,
                        Comment = r.Comment,
                        ReviewDate = r.CreatedAt
                    })
                    .OrderByDescending(r => r.ReviewDate)
                    .ToListAsync();

                return GeneralResponse<List<ReviewDto>>.Success(reviews);
            }
            catch (Exception ex)
            {
                return GeneralResponse<List<ReviewDto>>.Fail($"Error getting user reviews: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<List<ReviewDto>>> GetProductReviewsAsync(int productId)
        {
            try
            {
                // Validate product exists
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId && !p.IsDeleted);
                if (product == null)
                    return GeneralResponse<List<ReviewDto>>.Fail("Product not found");

                var reviews = await _context.Reviews
                    .Where(r => r.ProductId == productId && !r.IsDeleted)
                    .Include(r => r.Product)
                    .Include(r => r.User)
                    .Select(r => new ReviewDto
                    {
                        Id = r.Id,
                        ProductId = r.ProductId,
                        ProductName = r.Product.Name,
                        UserName = r.User.UserName ?? "Anonymous",
                        Rating = r.Rating,
                        Comment = r.Comment,
                        ReviewDate = r.CreatedAt
                    })
                    .OrderByDescending(r => r.ReviewDate)
                    .ToListAsync();

                return GeneralResponse<List<ReviewDto>>.Success(reviews);
            }
            catch (Exception ex)
            {
                return GeneralResponse<List<ReviewDto>>.Fail($"Error getting product reviews: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<ReviewDto>> CreateReviewAsync(CreateReviewDto dto, string userId)
        {
            try
            {
                // Validate input
                if (dto.Rating < 1 || dto.Rating > 5)
                    return GeneralResponse<ReviewDto>.Fail("Rating must be between 1 and 5");

                if (string.IsNullOrWhiteSpace(dto.Comment) || dto.Comment.Length < 3)
                    return GeneralResponse<ReviewDto>.Fail("Comment must be at least 3 characters long");

                // Validate product exists
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId && !p.IsDeleted);
                if (product == null)
                    return GeneralResponse<ReviewDto>.Fail("Product not found");

                // Check if user already reviewed this product
                var existingReview = await _context.Reviews
                    .FirstOrDefaultAsync(r => r.UserId == userId && r.ProductId == dto.ProductId && !r.IsDeleted);

                if (existingReview != null)
                    return GeneralResponse<ReviewDto>.Fail("You have already reviewed this product");

                // Check if user purchased this product
                var hasPurchased = await _context.Orders
                    .AnyAsync(o => o.UserId == userId && o.OrderItems.Any(oi => oi.ProductId == dto.ProductId) && !o.IsDeleted);

                if (!hasPurchased)
                    return GeneralResponse<ReviewDto>.Fail("You can only review products you have purchased");

                // Create review
                var review = new Review
                {
                    UserId = userId,
                    ProductId = dto.ProductId,
                    Rating = dto.Rating,
                    Comment = dto.Comment,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                // Map to DTO
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                var reviewDto = new ReviewDto
                {
                    Id = review.Id,
                    ProductId = product.Id,
                    ProductName = product.Name,
                    UserName = user?.UserName ?? "Anonymous",
                    Rating = review.Rating,
                    Comment = review.Comment,
                    ReviewDate = review.CreatedAt
                };

                return GeneralResponse<ReviewDto>.Success(reviewDto, "Review created successfully");
            }
            catch (Exception ex)
            {
                return GeneralResponse<ReviewDto>.Fail($"Error creating review: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<ReviewDto>> UpdateReviewAsync(int reviewId, UpdateReviewDto dto, string userId)
        {
            try
            {
                // Validate input
                if (dto.Rating < 1 || dto.Rating > 5)
                    return GeneralResponse<ReviewDto>.Fail("Rating must be between 1 and 5");

                if (string.IsNullOrWhiteSpace(dto.Comment) || dto.Comment.Length < 3)
                    return GeneralResponse<ReviewDto>.Fail("Comment must be at least 3 characters long");

                // Find review
                var review = await _context.Reviews
                    .Include(r => r.Product)
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId && !r.IsDeleted);

                if (review == null)
                    return GeneralResponse<ReviewDto>.Fail("Review not found");

                // Update review
                review.Rating = dto.Rating;
                review.Comment = dto.Comment;
                review.LastModifiedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Map to DTO
                var reviewDto = new ReviewDto
                {
                    Id = review.Id,
                    ProductId = review.ProductId,
                    ProductName = review.Product.Name,
                    UserName = review.User.UserName ?? "Anonymous",
                    Rating = review.Rating,
                    Comment = review.Comment,
                    ReviewDate = review.CreatedAt
                };

                return GeneralResponse<ReviewDto>.Success(reviewDto, "Review updated successfully");
            }
            catch (Exception ex)
            {
                return GeneralResponse<ReviewDto>.Fail($"Error updating review: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<string>> DeleteReviewAsync(int reviewId, string userId)
        {
            try
            {
                var review = await _context.Reviews
                    .FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId && !r.IsDeleted);

                if (review == null)
                    return GeneralResponse<string>.Fail("Review not found");

                // Soft delete
                review.IsDeleted = true;
                review.LastModifiedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return GeneralResponse<string>.Success("Review deleted successfully");
            }
            catch (Exception ex)
            {
                return GeneralResponse<string>.Fail($"Error deleting review: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<bool>> HasUserReviewedAsync(int productId, string userId)
        {
            try
            {
                var hasReviewed = await _context.Reviews
                    .AnyAsync(r => r.UserId == userId && r.ProductId == productId && !r.IsDeleted);

                return GeneralResponse<bool>.Success(hasReviewed);
            }
            catch (Exception ex)
            {
                return GeneralResponse<bool>.Fail($"Error checking review status: {ex.Message}");
            }
        }
    }
}