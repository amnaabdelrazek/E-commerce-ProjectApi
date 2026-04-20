using PayPal.Api;

namespace E_commerce_Project.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string userName, E_commerce_Project.Models.Order order);
    }
}
