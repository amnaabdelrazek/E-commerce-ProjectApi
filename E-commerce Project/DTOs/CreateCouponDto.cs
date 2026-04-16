namespace E_commerce_Project.DTOs
{
    public class CreateCouponDto
    {
        public string Code { get; set; }

        public decimal? DiscountPercentage { get; set; }
        public decimal DiscountAmount { get; set; }

        public DateTime ExpiryDate { get; set; }
    }
}
