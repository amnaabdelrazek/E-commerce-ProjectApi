namespace E_commerce_Project.Models
{
    public class OrderItem : BaseEntity
    {
        public int Id { get; set; }

        public int OrderId { get; set; }
        public virtual Order Order { get; set; }

        public int ProductId { get; set; }
        public virtual Product Product { get; set; }
        public string ProductName { get; set; } = string.Empty;

        public int Quantity { get; set; }
        public decimal PriceAtPurchase { get; set; }
    }
}
