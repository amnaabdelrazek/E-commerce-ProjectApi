namespace E_commerce_Project.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsyc(string email, string userName, int orderId);
    }
}
