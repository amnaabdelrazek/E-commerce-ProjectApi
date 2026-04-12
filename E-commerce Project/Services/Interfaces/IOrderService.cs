using E_commerce_Project.DTOs;
using E_commerce_Project.Responses;
using System.Security.Claims;

namespace E_commerce_Project.Services.Interfaces
{
    /// <summary>
    /// Interface for order processing and management (authenticated users only).
    /// </summary>
    public interface IOrderService
    {
        /// <summary>
        /// Calculate order summary with price breakdown (subtotal, tax, shipping, discount).
        /// </summary>
        Task<GeneralResponse<OrderSummaryDto>> CalculateOrderSummaryAsync(
            int cartId, 
            string? promoCode = null, 
            decimal? shippingCost = null);

        /// <summary>
        /// Validate and apply a promo/coupon code.
        /// </summary>
        Task<GeneralResponse<object>> ValidatePromoCodeAsync(string code, decimal subtotal);

        /// <summary>
        /// Create an order from cart items for authenticated users.
        /// </summary>
        Task<GeneralResponse<OrderDto>> CreateOrderAsync(
            ClaimsPrincipal userPrincipal, 
            CheckoutDto checkoutDto);

        /// <summary>
        /// Get order by ID (accessible to order owner only).
        /// </summary>
        Task<GeneralResponse<OrderDto>> GetOrderByIdAsync(int orderId, ClaimsPrincipal userPrincipal);

        /// <summary>
        /// Get all orders for authenticated user.
        /// </summary>
        Task<GeneralResponse<List<OrderDto>>> GetUserOrdersAsync(ClaimsPrincipal userPrincipal);

        /// <summary>
        /// Update order status (Admin only).
        /// </summary>
        Task<GeneralResponse<string>> UpdateOrderStatusAsync(int orderId, string newStatus);

        /// <summary>
        /// Cancel an order.
        /// </summary>
        Task<GeneralResponse<string>> CancelOrderAsync(int orderId, ClaimsPrincipal userPrincipal);

        /// <summary>
        /// Calculate shipping cost based on subtotal (free shipping above threshold).
        /// </summary>
        decimal CalculateShippingCost(decimal subtotal);

        /// <summary>
        /// Calculate tax amount.
        /// </summary>
        decimal CalculateTax(decimal subtotalAfterDiscount);
    }
}