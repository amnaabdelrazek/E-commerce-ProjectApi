namespace E_commerce_Project.DTOs
{
    public class CreateOrderDto
    {
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string DeliveryAddress { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string? PromoCode { get; set; }
        public string? Notes { get; set; }
        public List<int> CartItemIds { get; set; } = new List<int>();
    }
}