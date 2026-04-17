using E_commerce_Project.Data;
using E_commerce_Project.Models;
using E_commerce_Project.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using PayPal.Api;

public class PayPalService : IPayPalService
{
    private readonly PayPalSettings _settings;
    private readonly AppDbContext _context;

    public PayPalService(IConfiguration config, AppDbContext context)
    {
        _settings = config.GetSection("PayPal").Get<PayPalSettings>();
        _context = context;
    }

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

    // ================= CREATE =================
    public async Task<string> CreatePaymentAsync(int orderId)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            throw new Exception("Order not found");

        if (order.PaymentStatus == "Paid")
            throw new Exception("Order already paid");

        var apiContext = GetContext();

        var payment = new PayPal.Api.Payment
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
                        total = order.TotalPrice.ToString("F2")
                    }
                }
            },

            redirect_urls = new RedirectUrls
            {
                return_url = "https://localhost:4200/success",
                cancel_url = "https://localhost:4200/cancel"
            }
        };

        var created = payment.Create(apiContext);

        var approvalUrl = created.links
            .First(x => x.rel == "approval_url").href;

        // حفظ البيانات
        order.PaymentIntentId = created.id;
        order.PaymentMethod = "PayPal";
        order.PaymentStatus = "Pending";

        await _context.SaveChangesAsync();

        return approvalUrl;
    }

    // ================= EXECUTE =================
    public async Task<bool> ExecutePaymentAsync(string paymentId, string payerId)
    {
        var apiContext = GetContext();

        var execution = new PaymentExecution
        {
            payer_id = payerId
        };

        var payment = new PayPal.Api.Payment() { id = paymentId };

        var result = payment.Execute(apiContext, execution);

        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.PaymentIntentId == paymentId);

        if (order == null)
            return false;

        if (result.state.ToLower() == "approved")
        {
            order.PaymentStatus = "Paid";
            order.Status = "Confirmed";

            // 🔥 Transaction ID (Bonus)
            order.TransactionId = result.transactions[0]
                .related_resources[0]
                .sale.id;

            await _context.SaveChangesAsync();
            return true;
        }
        else
        {
            order.PaymentStatus = "Failed";
            await _context.SaveChangesAsync();
            return false;
        }
    }

    // ================= CANCEL =================
    public async Task CancelPaymentAsync(string paymentId)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.PaymentIntentId == paymentId);

        if (order != null)
        {
            order.PaymentStatus = "Cancelled";
            await _context.SaveChangesAsync();
        }
    }
}