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
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;
        private readonly ILogger<WishlistController> _logger;

        public WishlistController(IWishlistService wishlistService, ILogger<WishlistController> logger)
        {
            _wishlistService = wishlistService;
            _logger = logger;
        }
        [HttpGet]
        public async Task<IActionResult> GetUserWishlist()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _wishlistService.GetUserWishlistAsync(userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user wishlist");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpGet("count")]
        public async Task<IActionResult> GetWishlistCount()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _wishlistService.GetWishlistCountAsync(userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting wishlist count");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpGet("check/{productId}")]
        public async Task<IActionResult> IsInWishlist(int productId)
        {
            try
            {
                if (productId <= 0)
                    return BadRequest(new { message = "Invalid product ID" });

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _wishlistService.IsInWishlistAsync(productId, userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking wishlist");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpPost]
        public async Task<IActionResult> AddToWishlist([FromBody] AddToWishlistDto dto)
        {
            try
            {
                if (dto == null || dto.ProductId <= 0)
                    return BadRequest(new { message = "Invalid product ID" });

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _wishlistService.AddToWishlistAsync(dto.ProductId, userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding to wishlist");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpDelete("{wishlistId}")]
        public async Task<IActionResult> RemoveFromWishlist(int wishlistId)
        {
            try
            {
                if (wishlistId <= 0)
                    return BadRequest(new { message = "Invalid wishlist ID" });

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _wishlistService.RemoveFromWishlistAsync(wishlistId, userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing from wishlist");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpDelete("product/{productId}")]
        public async Task<IActionResult> RemoveFromWishlistByProduct(int productId)
        {
            try
            {
                if (productId <= 0)
                    return BadRequest(new { message = "Invalid product ID" });

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _wishlistService.RemoveFromWishlistByProductAsync(productId, userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing from wishlist");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpDelete("clear-all")]
        public async Task<IActionResult> ClearWishlist()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _wishlistService.ClearWishlistAsync(userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing wishlist");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}