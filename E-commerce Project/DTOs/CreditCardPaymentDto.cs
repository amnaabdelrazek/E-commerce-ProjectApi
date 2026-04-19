namespace E_commerce_Project.Controllers
{
    public class CreditCardPaymentDto
    {
        public int OrderId { get; set; }
        public string CardNumber { get; set; } = string.Empty;
        public string CardHolderName { get; set; } = string.Empty;
        public string ExpiryDate { get; set; } = string.Empty; // MM/YY format
        public string CVV { get; set; } = string.Empty;
    }
}
