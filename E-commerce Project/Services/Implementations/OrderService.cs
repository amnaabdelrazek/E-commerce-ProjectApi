using E_commerce_Project.Data;
using E_commerce_Project.DTOs;
using E_commerce_Project.Models;
using E_commerce_Project.Responses;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace E_commerce_Project.Services.Implementations
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ICartService _cartService;
        private const decimal DEFAULT_SHIPPING_COST = 10m;
        private const decimal FREE_SHIPPING_THRESHOLD = 100m;
        private const decimal TAX_RATE = 0.10m; // 10%

        public OrderService(
            AppDbContext context,
            UserManager<ApplicationUser> userManager,
            ICartService cartService)
        {
            _context = context;
            _userManager = userManager;
            _cartService = cartService;
        }
        public async Task<GeneralResponse<OrderSummaryDto>> CalculateOrderSummaryAsync(
            int cartId,
            string? promoCode = null,
            decimal? shippingCost = null)
        {
            try
            {
                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                    .FirstOrDefaultAsync(c => c.Id == cartId && !c.IsDeleted);

                if (cart == null)
                    return GeneralResponse<OrderSummaryDto>.Fail("Cart not found");

                var subtotal = cart.CartItems
                    .Where(ci => !ci.IsDeleted)
                    .Sum(ci => ci.Product.Price * ci.Quantity);
                var discountAmount = 0m;
                var appliedPromo = promoCode;

                if (!string.IsNullOrEmpty(promoCode))
                {
                    var validateResult = await ValidatePromoCodeAsync(promoCode, subtotal);
                    if (validateResult.IsSuccess)
                    {
                        var coupon = validateResult.Data as Coupon;
                        if (coupon != null)
                        {
                            if (coupon.DiscountPercentage.HasValue && coupon.DiscountPercentage > 0)
                            {
                                discountAmount = (subtotal * coupon.DiscountPercentage.Value) / 100m;
                                if (coupon.MaximumDiscountAmount.HasValue)
                                    discountAmount = Math.Min(discountAmount, coupon.MaximumDiscountAmount.Value);
                            }
                            else
                            {
                                discountAmount = coupon.DiscountAmount;
                            }
                        }
                    }
                    else
                    {
                        appliedPromo = null;
                    }
                }

                var subtotalAfterDiscount = subtotal - discountAmount;
                var taxAmount = CalculateTax(subtotalAfterDiscount);
                var shipping = shippingCost ?? CalculateShippingCost(subtotal);

                var summary = new OrderSummaryDto
                {
                    SubTotal = subtotal,
                    DiscountAmount = discountAmount,
                    AppliedPromoCode = appliedPromo,
                    TaxAmount = taxAmount,
                    ShippingCost = shipping,
                    TaxRate = TAX_RATE,
                    FreeShippingThreshold = FREE_SHIPPING_THRESHOLD
                };

                return GeneralResponse<OrderSummaryDto>.Success(summary);
            }
            catch (Exception ex)
            {
                return GeneralResponse<OrderSummaryDto>.Fail($"Error calculating order summary: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<object>> ValidatePromoCodeAsync(string code, decimal subtotal)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(code))
                    return GeneralResponse<object>.Fail("Promo code cannot be empty");

                var coupon = await _context.Coupons
                    .FirstOrDefaultAsync(c => c.Code.ToUpper() == code.ToUpper() && !c.IsDeleted);

                if (coupon == null)
                    return GeneralResponse<object>.Fail("Invalid promo code");
                if (!coupon.IsActive)
                    return GeneralResponse<object>.Fail("Promo code is no longer active");

                if (coupon.ExpiryDate < DateTime.UtcNow)
                    return GeneralResponse<object>.Fail("Promo code has expired");

                if (coupon.MaxUsageCount.HasValue && coupon.CurrentUsageCount >= coupon.MaxUsageCount)
                    return GeneralResponse<object>.Fail("Promo code usage limit reached");
                if (subtotal < coupon.MinimumPurchaseAmount)
                    return GeneralResponse<object>.Fail(
                        $"Minimum purchase amount of {coupon.MinimumPurchaseAmount:C} required");

                return GeneralResponse<object>.Success(coupon, "Promo code is valid");
            }
            catch (Exception ex)
            {
                return GeneralResponse<object>.Fail($"Error validating promo code: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<OrderDto>> CreateOrderAsync(
            ClaimsPrincipal userPrincipal,
            CheckoutDto checkoutDto)
        {
            try
            {
                var user = await _userManager.GetUserAsync(userPrincipal);
                if (user == null)
                    return GeneralResponse<OrderDto>.Fail("User not found");

                var cartResult = await _cartService.GetUserCartAsync(userPrincipal);
                if (!cartResult.IsSuccess || cartResult.Data == null || cartResult.Data.Items.Count == 0)
                    return GeneralResponse<OrderDto>.Fail("Cart is empty");

                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                    .FirstOrDefaultAsync(c => c.UserId == user.Id && !c.IsDeleted);

                var inventoryResult = await _cartService.ValidateCartInventoryAsync(cart!.Id);
                if (!inventoryResult.IsSuccess)
                    return GeneralResponse<OrderDto>.Fail(inventoryResult.Message);

                var summaryResult = await CalculateOrderSummaryAsync(
                    cart.Id,
                    checkoutDto.PromoCode);

                if (!summaryResult.IsSuccess)
                    return GeneralResponse<OrderDto>.Fail(summaryResult.Message);

                var summary = summaryResult.Data;

                var order = new Order
                {
                    UserId = user.Id,
                    Email = user.Email!,
                    DeliveryAddress = FormatAddress(checkoutDto),
                    PhoneNumber = checkoutDto.PhoneNumber,
                    SubTotal = summary.SubTotal,
                    DiscountAmount = summary.DiscountAmount,
                    AppliedPromoCode = summary.AppliedPromoCode,
                    TaxAmount = summary.TaxAmount,
                    ShippingCost = summary.ShippingCost,
                    TotalPrice = summary.Total,
                    PaymentMethod = checkoutDto.PaymentMethod,
                    Status = "Confirmed",
                    Notes = checkoutDto.OrderNotes,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                foreach (var cartItem in cart.CartItems.Where(ci => !ci.IsDeleted))
                {
                    var orderItem = new OrderItem
                    {
                        OrderId = order.Id,
                        ProductId = cartItem.ProductId,
                        ProductName = cartItem.Product.Name,
                        Quantity = cartItem.Quantity,
                        PriceAtPurchase = cartItem.Product.Price,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.OrderItems.Add(orderItem);

                    cartItem.Product.StockQuantity -= cartItem.Quantity;
                }
                if (!string.IsNullOrEmpty(summary.AppliedPromoCode))
                {
                    var coupon = await _context.Coupons
                        .FirstOrDefaultAsync(c => c.Code.ToUpper() == summary.AppliedPromoCode.ToUpper());
                    if (coupon != null)
                    {
                        coupon.CurrentUsageCount++;
                    }
                }
                await _cartService.ClearCartAsync(user.Id);

                await _context.SaveChangesAsync();

                var orderDto = MapOrderToDto(order, new List<OrderItem>(
                    cart.CartItems
                        .Where(ci => !ci.IsDeleted)
                        .Select(ci => new OrderItem
                        {
                            ProductId = ci.ProductId,
                            ProductName = ci.Product.Name,
                            Quantity = ci.Quantity,
                            PriceAtPurchase = ci.Product.Price
                        })));

                return GeneralResponse<OrderDto>.Success(orderDto, "Order created successfully");
            }
            catch (Exception ex)
            {
                return GeneralResponse<OrderDto>.Fail($"Error creating order: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<OrderDto>> GetOrderByIdAsync(int orderId, ClaimsPrincipal userPrincipal)
        {
            try
            {
                var user = await _userManager.GetUserAsync(userPrincipal);
                if (user == null)
                    return GeneralResponse<OrderDto>.Fail("User not found");

                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == user.Id && !o.IsDeleted);

                if (order == null)
                    return GeneralResponse<OrderDto>.Fail("Order not found");

                var orderDto = MapOrderToDto(order);
                return GeneralResponse<OrderDto>.Success(orderDto);
            }
            catch (Exception ex)
            {
                return GeneralResponse<OrderDto>.Fail($"Error getting order: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<List<OrderDto>>> GetUserOrdersAsync(ClaimsPrincipal userPrincipal)
        {
            try
            {
                var user = await _userManager.GetUserAsync(userPrincipal);
                if (user == null)
                    return GeneralResponse<List<OrderDto>>.Fail("User not found");

                var orders = await _context.Orders
                    .Include(o => o.OrderItems)
                    .Where(o => o.UserId == user.Id && !o.IsDeleted)
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync();

                var orderDtos = orders.Select(o => MapOrderToDto(o)).ToList();
                return GeneralResponse<List<OrderDto>>.Success(orderDtos);
            }
            catch (Exception ex)
            {
                return GeneralResponse<List<OrderDto>>.Fail($"Error getting user orders: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<string>> UpdateOrderStatusAsync(int orderId, string newStatus)
        {
            try
            {
                var validStatuses = new[] { "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled" };
                if (!validStatuses.Contains(newStatus))
                    return GeneralResponse<string>.Fail("Invalid order status");

                var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == orderId && !o.IsDeleted);
                if (order == null)
                    return GeneralResponse<string>.Fail("Order not found");

                order.Status = newStatus;
                order.LastModifiedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return GeneralResponse<string>.Success("", "Order status updated successfully");
            }
            catch (Exception ex)
            {
                return GeneralResponse<string>.Fail($"Error updating order status: {ex.Message}");
            }
        }
        public async Task<GeneralResponse<string>> CancelOrderAsync(int orderId, ClaimsPrincipal userPrincipal)
        {
            try
            {
                var user = await _userManager.GetUserAsync(userPrincipal);
                if (user == null)
                    return GeneralResponse<string>.Fail("User not found");

                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .FirstOrDefaultAsync(o => o.Id == orderId && !o.IsDeleted);

                if (order == null)
                    return GeneralResponse<string>.Fail("Order not found");

                if (order.UserId != user.Id)
                    return GeneralResponse<string>.Fail("Unauthorized");

                if (order.Status == "Delivered" || order.Status == "Cancelled")
                    return GeneralResponse<string>.Fail("Cannot cancel this order");

                foreach (var item in order.OrderItems.Where(oi => !oi.IsDeleted))
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product != null)
                    {
                        product.StockQuantity += item.Quantity;
                    }
                }

                // Mark order as deleted instead of just changing status
                order.IsDeleted = true;
                order.Status = "Cancelled";
                order.LastModifiedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return GeneralResponse<string>.Success("", "Order cancelled successfully");
            }
            catch (Exception ex)
            {
                return GeneralResponse<string>.Fail($"Error cancelling order: {ex.Message}");
            }
        }
                public decimal CalculateShippingCost(decimal subtotal)
        {
            return subtotal >= FREE_SHIPPING_THRESHOLD ? 0m : DEFAULT_SHIPPING_COST;
        }

        public decimal CalculateTax(decimal subtotalAfterDiscount)
        {
            return subtotalAfterDiscount * TAX_RATE;
        }
        private string FormatAddress(CheckoutDto checkoutDto)
        {
            return $"{checkoutDto.Address}, {checkoutDto.City}, {checkoutDto.State} {checkoutDto.PostalCode}, {checkoutDto.Country}";
        }
        private OrderDto MapOrderToDto(Order order, List<OrderItem>? items = null)
        {
            items ??= order.OrderItems.Where(oi => !oi.IsDeleted).ToList();

            return new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                Status = order.Status,
                TotalPrice = order.TotalPrice,
                DiscountAmount = order.DiscountAmount,
                PromoCode = order.AppliedPromoCode,
                TaxAmount = order.TaxAmount,
                ShippingCost = order.ShippingCost,
                PaymentMethod = order.PaymentMethod,
                CreatedAt = order.CreatedAt,
                Items = items.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.ProductName,
                    PriceAtPurchase = oi.PriceAtPurchase,
                    Quantity = oi.Quantity
                }).ToList()
            };
        }
    }
}
