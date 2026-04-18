using GitHub.Copilot.SDK.Rpc;

namespace E_commerce_Project.Models
{
    public class Product:BaseEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }

        public int CategoryId { get; set; }
        public Category Category { get; set; }

        public int SellerId { get; set; }
        public Seller Seller { get; set; }


        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
