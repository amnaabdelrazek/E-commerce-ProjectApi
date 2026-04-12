using E_commerce_Project.DTOs;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace E_commerce_Project.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly ILogger<CartController> _logger;

        public CartController(ICartService cartService, ILogger<CartController> logger)
        {
            _cartService = cartService;
            _logger = logger;
        }
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            try
            {
                var result = await _cartService.GetUserCartAsync(User);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpGet("count")]
        public async Task<IActionResult> GetCartItemCount()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _cartService.GetCartItemCountAsync(userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart item count");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpPost("add-item")]
        public async Task<IActionResult> AddItemToCart([FromBody] AddToCartDto dto)
        {
            try
            {
                if (dto == null || dto.ProductId <= 0 || dto.Quantity <= 0)
                    return BadRequest(new { message = "Invalid product ID or quantity" });

                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _cartService.AddItemToCartAsync(dto.ProductId, dto.Quantity, userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding item to cart");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpPut("update-item")]
        public async Task<IActionResult> UpdateCartItemQuantity([FromBody] UpdateCartItemDto dto)
        {
            try
            {
                if (dto == null || dto.CartItemId <= 0)
                    return BadRequest(new { message = "Invalid cart item ID" });

                if (dto.NewQuantity <= 0)
                    return BadRequest(new { message = "Quantity must be positive" });

                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _cartService.UpdateCartItemQuantityAsync(
                    dto.CartItemId,
                    dto.NewQuantity,
                    userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cart item");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpDelete("remove-item/{cartItemId}")]
        public async Task<IActionResult> RemoveItemFromCart(int cartItemId)
        {
            try
            {
                if (cartItemId <= 0)
                    return BadRequest(new { message = "Invalid cart item ID" });

                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _cartService.RemoveItemFromCartAsync(cartItemId, userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing item from cart");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                var result = await _cartService.ClearCartAsync(userIdClaim);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cart");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpPost("validate-inventory")]
        public async Task<IActionResult> ValidateCartInventory([FromBody] ValidateInventoryDto dto)
        {
            try
            {
                if (dto == null || dto.CartId <= 0)
                    return BadRequest(new { message = "Invalid cart ID" });

                var result = await _cartService.ValidateCartInventoryAsync(dto.CartId);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating inventory");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
    public class AddToCartDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
    public class UpdateCartItemDto
    {
        public int CartItemId { get; set; }
        public int NewQuantity { get; set; }
    }
    public class ValidateInventoryDto
    {
        public int CartId { get; set; }
    }
}