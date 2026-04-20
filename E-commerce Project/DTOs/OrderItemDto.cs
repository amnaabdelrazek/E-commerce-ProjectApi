namespace E_commerce_Project.DTOs
{
    public class OrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public decimal PriceAtPurchase { get; set; }
        public int Quantity { get; set; }
        public decimal ItemTotal => PriceAtPurchase * Quantity;
    }
}
