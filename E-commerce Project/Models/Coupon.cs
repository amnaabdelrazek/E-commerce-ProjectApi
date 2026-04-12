namespace E_commerce_Project.Models
{
    public class Coupon : BaseEntity
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal MinimumPurchaseAmount { get; set; } = 0m;
        public decimal? MaximumDiscountAmount { get; set; }
        public DateTime ExpiryDate { get; set; }
        public bool IsActive { get; set; } = true;
        public int? MaxUsageCount { get; set; }
        public int CurrentUsageCount { get; set; } = 0;
        public string? Description { get; set; }
    }
}
