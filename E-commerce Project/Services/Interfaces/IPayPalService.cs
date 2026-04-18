namespace E_commerce_Project.Services.Interfaces
{
    public interface IPayPalService
    {
        Task<string> CreatePaymentAsync(int orderId);
        Task<bool> ExecutePaymentAsync(string paymentId, string payerId);
        Task CancelPaymentAsync(string paymentId);
    }
}