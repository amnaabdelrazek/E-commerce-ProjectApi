using E_commerce_Project.Services.Interfaces;
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using E_commerce_Project.Models;
namespace E_commerce_Project.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        public EmailService(IConfiguration config)
        {
            _configuration = config;
        }
        public async Task SendEmailAsync(string toEmail, string userName,Order order)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_configuration["EmailSettings:DisplayName"], _configuration["EmailSettings:Email"]));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = "Confirmation Order";

            var builder = new BodyBuilder();
            //string statusUrl = $"http://localhost:33949/api/Checkout/order/{orderId}";
            string itemsHtml = "";
            foreach(var item in order.OrderItems)
            {
                itemsHtml += $@"
                <tr>
                <td style='padding: 10px; border-bottom: 1px solid #eee;'>{item.ProductName}</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee; text-align: center;'>{item.Quantity}</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee; text-align: right;'>${item.PriceAtPurchase:N2}</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee; text-align: right;'>${(item.PriceAtPurchase * item.Quantity):N2}</td>
                </tr>";
                
            }
            builder.HtmlBody = $@"
    <div style='font-family: ""Segoe UI"", sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;'>
        <h2 style='color: #2c3e50; text-align: center;'>Order Confirmed!</h2>
        <p>Hi {userName}, your order has been placed successfully.</p>
        
        <table style='width: 100%; border-collapse: collapse; margin-top: 20px;'>
            <thead>
                <tr style='background-color: #f8f9fa;'>
                    <th style='padding: 10px; text-align: left;'>Product</th>
                    <th style='padding: 10px; text-align: center;'>Qty</th>
                    <th style='padding: 10px; text-align: right;'>Price</th>
                    <th style='padding: 10px; text-align: right;'>Total</th>
                </tr>
            </thead>
            <tbody>
                {itemsHtml}
            </tbody>
        </table>

        <div style='margin-top: 20px; text-align: right; line-height: 1.6;'>
            <p><strong>Subtotal:</strong> ${order.SubTotal:N2}</p>
            <p><strong>Discount:</strong> -${order.DiscountAmount:N2}</p>
            <p><strong>Shipping:</strong> ${order.ShippingCost:N2}</p>
            <p><strong>TAX:</strong> 10%</p>
            <p style='font-size: 18px; color: #2ecc71;'><strong>Total: ${order.TotalPrice:N2}</strong></p>
        </div>

        <div style='margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;'>
            <p style='margin: 0;'><strong>Shipping Address:</strong><br>{order.DeliveryAddress}</p>
        </div>
        
        <p style='text-align: center; color: #7f8c8d; font-size: 12px; margin-top: 30px;'>
            Thank you for shopping with us!
        </p>
    </div>";

            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            try
            {
                await smtp.ConnectAsync(_configuration["EmailSettings:Host"], 587, MailKit.Security.SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_configuration["EmailSettings:Email"], _configuration["EmailSettings:Password"]);
                await smtp.SendAsync(email);
            }
            finally
            {
                await smtp.DisconnectAsync(true);
            }
        }

       
    }
}
