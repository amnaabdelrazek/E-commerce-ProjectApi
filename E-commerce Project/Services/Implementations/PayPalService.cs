using E_commerce_Project.Data;
using E_commerce_Project.Models;
using E_commerce_Project.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using PayPal;
using PayPal.Api;

namespace E_commerce_Project.Services.Implementations
{
    public class PayPalService : IPayPalService
{
    private readonly PayPalSettings _settings;
    private readonly AppDbContext _context;
    private readonly ILogger<PayPalService> _logger;

    public PayPalService(IConfiguration config, AppDbContext context, ILogger<PayPalService> logger)
    {
        _settings = config.GetSection("PayPal").Get<PayPalSettings>() ?? new PayPalSettings();
        _context = context;
        _logger = logger;
    }

    // ================= GET PAYPAL CONTEXT =================
    private APIContext GetContext()
    {
        var config = new Dictionary<string, string>
        {
            { "mode", _settings.Mode }
        };

        var token = new OAuthTokenCredential(
            _settings.ClientId,
            _settings.Secret,
            config).GetAccessToken();

        return new APIContext(token);
    }

    // ================= CREATE PAYMENT =================
    public async Task<string> CreatePaymentAsync(int orderId)
    {
        try
        {
            _logger.LogInformation($"Creating PayPal payment for order {orderId}");
            
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                _logger.LogError($"Order {orderId} not found");
                throw new Exception("Order not found");
            }

            _logger.LogInformation($"Order found: {order.Id}, Total: {order.TotalPrice}, Items: {order.OrderItems?.Count ?? 0}");

            var apiContext = GetContext();

            // Build item list
            var items = new List<Item>();
            if (order.OrderItems != null && order.OrderItems.Count > 0)
            {
                foreach (var item in order.OrderItems)
                {
                    items.Add(new Item
                    {
                        name = item.ProductName ?? "Product",
                        quantity = item.Quantity.ToString(),
                        price = item.PriceAtPurchase.ToString("F2"),
                        currency = "USD"
                    });
                }
            }

            // Build amount details
            var amountDetails = new Details
            {
                subtotal = order.SubTotal.ToString("F2"),
                tax = order.TaxAmount.ToString("F2"),
                shipping = order.ShippingCost.ToString("F2")
            };

            var payment = new Payment
            {
                intent = "sale",
                payer = new Payer { payment_method = "paypal" },

                transactions = new List<Transaction>
                {
                    new Transaction
                    {
                        description = $"Order #{order.Id}",
                        amount = new Amount
                        {
                            currency = "USD",
                            total = order.TotalPrice.ToString("F2"),
                            details = amountDetails
                        },
                        item_list = new ItemList
                        {
                            items = items
                        }
                    }
                },

                redirect_urls = new RedirectUrls
                {
                    return_url = $"{_settings.FrontendUrl}/success?orderId={order.Id}",
                    cancel_url = $"{_settings.FrontendUrl}/cancel"
                }
            };

            var created = payment.Create(apiContext);
            _logger.LogInformation($"PayPal payment created: {created.id}");

            var approvalUrl = created.links
                .First(x => x.rel == "approval_url").href;

            _logger.LogInformation($"Approval URL: {approvalUrl}");

            order.Status = "Pending";
            await _context.SaveChangesAsync();

            return approvalUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error creating PayPal payment for order {orderId}");
            throw;
        }
    }

    // ================= EXECUTE PAYMENT =================
    public async Task<bool> ExecutePaymentAsync(string paymentId, string payerId)
    {
        try
        {
            _logger.LogInformation($"========== Executing PayPal Payment ==========");
            _logger.LogInformation($"Payment ID: {paymentId}, Payer ID: {payerId}");
            
            var apiContext = GetContext();

            var execution = new PaymentExecution
            {
                payer_id = payerId
            };

            var payment = new PayPal.Api.Payment()
            {
                id = paymentId
            };

            _logger.LogInformation($"Calling PayPal Execute API...");
            var result = payment.Execute(apiContext, execution);
            
            _logger.LogInformation($"PayPal Response State: {result.state}");

            if (result.state.ToLower() == "approved")
            {
                _logger.LogInformation($"✅ Payment approved for ID: {paymentId}");
                return true;
            }

            _logger.LogWarning($"❌ Payment not approved. State: {result.state}");
            return false;
        }
        catch (HttpException hex)
        {
            _logger.LogError($"❌ PayPal HTTP Error: {hex.Message}");
            
            string errorMsg = "PayPal payment execution failed";
            
            // Check message for status codes
            if (hex.Message.Contains("404"))
            {
                errorMsg = "Payment not found. It may have expired or been cancelled.";
            }
            else if (hex.Message.Contains("400"))
            {
                errorMsg = "Invalid payment or payer ID. Payment may have expired.";
            }
            
            throw new Exception(errorMsg, hex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error executing PayPal payment for ID: {paymentId}");
            throw;
        }
    }

    // ================= CANCEL PAYMENT =================
    public async Task CancelPaymentAsync(string paymentId)
    {
        // optional: log cancellation or update status
        await Task.CompletedTask;
    }
}
}