// DTOs/ProductListDto.cs
namespace E_commerce_Project.DTOs
{
    public class ProductListDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
        public string CategoryName { get; set; }
    }
}
