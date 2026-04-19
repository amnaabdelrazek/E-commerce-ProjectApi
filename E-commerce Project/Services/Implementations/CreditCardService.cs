using E_commerce_Project.Data;
using E_commerce_Project.Models;
using E_commerce_Project.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace E_commerce_Project.Services.Implementations
{
    public class CreditCardService : ICreditCardService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CreditCardService> _logger;

        public CreditCardService(AppDbContext context, ILogger<CreditCardService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<(bool Success, string Message)> ProcessPaymentAsync(
            int orderId, 
            string cardNumber, 
            string cardHolderName, 
            string expiryDate, 
            string cvv)
        {
            try
            {
                _logger.LogInformation($"Processing credit card payment for order {orderId}");

                // Validate input
                if (string.IsNullOrWhiteSpace(cardNumber) || cardNumber.Length < 13)
                    return (false, "Invalid card number");

                if (string.IsNullOrWhiteSpace(cardHolderName))
                    return (false, "Card holder name is required");

                if (string.IsNullOrWhiteSpace(expiryDate) || !expiryDate.Contains("/"))
                    return (false, "Invalid expiry date format (MM/YY)");

                if (string.IsNullOrWhiteSpace(cvv) || cvv.Length < 3)
                    return (false, "Invalid CVV");

                // Get the order
                var order = await _context.Orders
                    .FirstOrDefaultAsync(o => o.Id == orderId && !o.IsDeleted);

                if (order == null)
                {
                    _logger.LogError($"Order {orderId} not found");
                    return (false, "Order not found");
                }

                // Simulate payment processing
                _logger.LogInformation($"Processing payment for order {orderId}: ${order.TotalPrice}");

                // In a real app, you would:
                // 1. Encrypt the card data
                // 2. Send to payment processor (Stripe, etc)
                // 3. Get confirmation

                // For now, we'll simulate a successful payment
                order.Status = "Paid";
                order.LastModifiedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"✅ Credit card payment successful for order {orderId}");
                return (true, "Payment processed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing credit card payment for order {orderId}");
                return (false, $"Payment processing failed: {ex.Message}");
            }
        }
    }
}
