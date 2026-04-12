namespace E_commerce_Project.DTOs
{
    public class CartDto
    {
        public int Id { get; set; }
        public string? UserId { get; set; }
        public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();
        public decimal SubTotal => Items.Sum(x => x.ItemSubtotal);
        public int ItemCount => Items.Sum(x => x.Quantity);
    }
}