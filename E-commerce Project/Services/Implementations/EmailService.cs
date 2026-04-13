using E_commerce_Project.Services.Interfaces;
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
namespace E_commerce_Project.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        public EmailService(IConfiguration config)
        {
            _configuration = config;
        }
        public async Task SendEmailAsyc(string toEmail, string userName, int orderId)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_configuration["EmailSettings:DisplayName"], _configuration["EmailSettings:Email"]));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = "Confirmation Order";

            var bulider = new BodyBuilder();
            string statusUrl = $"http://localhost:33949/api/Checkout/order/{orderId}";
            bulider.HtmlBody = $@"
              <div style='font-family: ""Segoe UI"", Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; padding: 40px; color: #333;'>
        <div style='text-align: center; margin-bottom: 30px;'>
            <h1 style='color: #2c3e50; margin-bottom: 5px;'>Order Confirmed!</h1>
            <p style='color: #7f8c8d; font-size: 16px;'>Thank you for your purchase.</p>
        </div>

        <div style='border-top: 2px solid #3498db; border-bottom: 2px solid #3498db; padding: 20px 0; margin-bottom: 30px;'>
            <p style='margin: 5px 0;'><strong>Order Number:</strong> #{orderId}</p>
            <p style='margin: 5px 0;'><strong>Order Date:</strong> {DateTime.Now.ToString("MMMM dd, yyyy")}</p>
        </div>

        <p style='font-size: 16px; line-height: 1.6;'>
            Hi {userName},<br><br>
            We've received your order and our team is already working on it! You'll receive another email with a tracking number once your package ships.
        </p>

        <div style='text-align: center; margin-top: 40px;'>
            <a href='{statusUrl}' style='background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>View Order Status</a>
        </div>

        <hr style='border: 0; border-top: 1px solid #eee; margin-top: 40px;'>
        
        <p style='font-size: 12px; color: #95a5a6; text-align: center;'>
            If you have any questions, contact our support team.<br>
            &copy; {DateTime.Now.Year} E-Commerce Project. All rights reserved.
        </p>
    </div>";

            email.Body = bulider.ToMessageBody();

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
