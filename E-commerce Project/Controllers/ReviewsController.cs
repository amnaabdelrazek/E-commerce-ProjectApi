using E_commerce_Project.DTOs;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace E_commerce_Project.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly ILogger<ReviewsController> _logger;

        public ReviewsController(IReviewService reviewService, ILogger<ReviewsController> logger)
        {
            _reviewService = reviewService;
            _logger = logger;
        }
        [HttpGet]
        public async Task<IActionResult> GetUserReviews()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _reviewService.GetUserReviewsAsync(userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user reviews");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpGet("product/{productId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductReviews(int productId)
        {
            try
            {
                if (productId <= 0)
                    return BadRequest(new { message = "Invalid product ID" });

                var result = await _reviewService.GetProductReviewsAsync(productId);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product reviews");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpGet("has-reviewed/{productId}")]
        public async Task<IActionResult> HasUserReviewed(int productId)
        {
            try
            {
                if (productId <= 0)
                    return BadRequest(new { message = "Invalid product ID" });

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _reviewService.HasUserReviewedAsync(productId, userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking review status");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
        {
            try
            {
                if (dto == null || dto.ProductId <= 0)
                    return BadRequest(new { message = "Invalid product ID" });

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _reviewService.CreateReviewAsync(dto, userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpPut("{reviewId}")]
        public async Task<IActionResult> UpdateReview(int reviewId, [FromBody] UpdateReviewDto dto)
        {
            try
            {
                if (reviewId <= 0)
                    return BadRequest(new { message = "Invalid review ID" });

                if (dto == null)
                    return BadRequest(new { message = "Invalid request body" });

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _reviewService.UpdateReviewAsync(reviewId, dto, userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpDelete("{reviewId}")]
        public async Task<IActionResult> DeleteReview(int reviewId)
        {
            try
            {
                if (reviewId <= 0)
                    return BadRequest(new { message = "Invalid review ID" });

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _reviewService.DeleteReviewAsync(reviewId, userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}