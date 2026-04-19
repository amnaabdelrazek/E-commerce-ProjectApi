namespace E_commerce_Project.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public string? UserId { get; set; }
        public string UserFullName { get; set; }
        public string Status { get; set; } = "Pending";
        public decimal TotalPrice { get; set; }
        public decimal DiscountAmount { get; set; }
        public string? PromoCode { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal ShippingCost { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
    }
}
