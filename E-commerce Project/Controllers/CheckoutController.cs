using E_commerce_Project.DTOs;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace E_commerce_Project.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CheckoutController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ICartService _cartService;
        private readonly ILogger<CheckoutController> _logger;

        public CheckoutController(
            IOrderService orderService,
            ICartService cartService,
            ILogger<CheckoutController> logger)
        {
            _orderService = orderService;
            _cartService = cartService;
            _logger = logger;
        }
        [Authorize]
        [HttpPost("calculate-summary")]
        public async Task<IActionResult> CalculateOrderSummary([FromBody] CalculateSummaryDto dto)
        {
            try
            {
                if (dto == null || dto.CartId <= 0)
                    return BadRequest(new { message = "Invalid cart ID" });

                var result = await _orderService.CalculateOrderSummaryAsync(
                    dto.CartId,
                    dto.PromoCode);

                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating order summary");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [Authorize(Roles = "Seller,Admin")]
        [HttpPost("validate-promo")]
        public async Task<IActionResult> ValidatePromoCode([FromBody] ValidatePromoDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto?.PromoCode))
                    return BadRequest(new { message = "Promo code is required" });

                if (dto.Subtotal <= 0)
                    return BadRequest(new { message = "Invalid subtotal" });

                var result = await _orderService.ValidatePromoCodeAsync(dto.PromoCode, dto.Subtotal);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating promo code");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [Authorize]
        [HttpPost("user-checkout")]
        public async Task<IActionResult> UserCheckout([FromBody] CheckoutDto checkoutDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (checkoutDto == null)
                    return BadRequest(new { message = "Checkout details are required" });
                var validationResult = ValidateCheckoutData(checkoutDto);
                if (!validationResult.IsValid)
                    return BadRequest(new { message = validationResult.ErrorMessage });

                var result = await _orderService.CreateOrderAsync(User, checkoutDto);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user checkout");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [Authorize]
        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetOrder(int orderId)
        {
            try
            {
                if (orderId <= 0)
                    return BadRequest(new { message = "Invalid order ID" });

                var result = await _orderService.GetOrderByIdAsync(orderId, User);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [Authorize]
        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders()
        {
            try
            {
                var result = await _orderService.GetUserOrdersAsync(User);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user orders");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [Authorize]
        [HttpPost("cancel-order/{orderId}")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            try
            {
                if (orderId <= 0)
                    return BadRequest(new { message = "Invalid order ID" });

                var result = await _orderService.CancelOrderAsync(orderId, User);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling order");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [Authorize(Roles = "Admin")]
        [HttpPut("update-status/{orderId}")]
        public async Task<IActionResult> UpdateOrderStatus(
            int orderId,
            [FromBody] UpdateOrderStatusDto dto)
        {
            try
            {
                if (orderId <= 0)
                    return BadRequest(new { message = "Invalid order ID" });

                if (string.IsNullOrEmpty(dto?.NewStatus))
                    return BadRequest(new { message = "New status is required" });

                var result = await _orderService.UpdateOrderStatusAsync(orderId, dto.NewStatus);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order status");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        private ValidationResult ValidateCheckoutData(CheckoutDto checkoutDto)
        {
            if (string.IsNullOrWhiteSpace(checkoutDto.FirstName))
                return ValidationResult.Invalid("First name is required");

            if (string.IsNullOrWhiteSpace(checkoutDto.LastName))
                return ValidationResult.Invalid("Last name is required");

            if (string.IsNullOrWhiteSpace(checkoutDto.Address))
                return ValidationResult.Invalid("Address is required");

            if (string.IsNullOrWhiteSpace(checkoutDto.City))
                return ValidationResult.Invalid("City is required");

            if (string.IsNullOrWhiteSpace(checkoutDto.State))
                return ValidationResult.Invalid("State is required");

            if (string.IsNullOrWhiteSpace(checkoutDto.PostalCode))
                return ValidationResult.Invalid("Postal code is required");

            if (string.IsNullOrWhiteSpace(checkoutDto.Country))
                return ValidationResult.Invalid("Country is required");

            if (string.IsNullOrWhiteSpace(checkoutDto.PhoneNumber))
                return ValidationResult.Invalid("Phone number is required");

            if (string.IsNullOrWhiteSpace(checkoutDto.PaymentMethod))
                return ValidationResult.Invalid("Payment method is required");

            return ValidationResult.Valid();
        }

        private class ValidationResult
        {
            public bool IsValid { get; set; }
            public string ErrorMessage { get; set; } = string.Empty;

            public static ValidationResult Valid() => new() { IsValid = true };
            public static ValidationResult Invalid(string message) => new() { IsValid = false, ErrorMessage = message };
        }
    }
    public class CalculateSummaryDto
    {
        public int CartId { get; set; }
        public string? PromoCode { get; set; }
    }
    public class ValidatePromoDto
    {
        public string PromoCode { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
    }
    public class UpdateOrderStatusDto
    {
        public string NewStatus { get; set; } = string.Empty;
    }
}
