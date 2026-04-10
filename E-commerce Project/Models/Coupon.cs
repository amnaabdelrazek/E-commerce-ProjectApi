namespace E_commerce_Project.Models
{
    public class Coupon : BaseEntity
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public DateTime ExpiryDate { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
