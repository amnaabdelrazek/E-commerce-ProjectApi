namespace E_commerce_Project.Services.Interfaces
{
    public interface ICreditCardService
    {
        Task<(bool Success, string Message)> ProcessPaymentAsync(int orderId, string cardNumber, string cardHolderName, string expiryDate, string cvv);
    }
}
