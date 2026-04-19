namespace E_commerce_Project.Models
{
    public class Order : BaseEntity
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public virtual ApplicationUser User { get; set; }
        public string Email { get; set; } = string.Empty;
        public string DeliveryAddress { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public string? AppliedPromoCode { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal TotalPrice { get; set; }
        public string PaymentMethod { get; set; } = "CreditCard";
        public string Status { get; set; } = "Pending";
        public string? Notes { get; set; }
        public string? PaymentIntentId { get; set; }

        // ================= NAVIGATION =================
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}