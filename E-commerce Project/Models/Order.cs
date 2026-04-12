namespace E_commerce_Project.Models
{
    public class Order : BaseEntity
    {
        public int Id { get; set; }

        /// <summary>
        /// User ID (required - authenticated users only).
        /// </summary>
        public string UserId { get; set; } = string.Empty;
        public virtual ApplicationUser User { get; set; }

        /// <summary>
        /// Email for order notifications.
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Delivery address.
        /// </summary>
        public string DeliveryAddress { get; set; } = string.Empty;

        /// <summary>
        /// Phone number for delivery contact.
        /// </summary>
        public string? PhoneNumber { get; set; }

        /// <summary>
        /// Subtotal before discounts, tax, and shipping.
        /// </summary>
        public decimal SubTotal { get; set; }

        /// <summary>
        /// Discount amount from promo code.
        /// </summary>
        public decimal DiscountAmount { get; set; }

        /// <summary>
        /// Applied promo/coupon code.
        /// </summary>
        public string? AppliedPromoCode { get; set; }

        /// <summary>
        /// Tax amount.
        /// </summary>
        public decimal TaxAmount { get; set; }

        /// <summary>
        /// Shipping cost.
        /// </summary>
        public decimal ShippingCost { get; set; }

        /// <summary>
        /// Total price after all calculations.
        /// </summary>
        public decimal TotalPrice { get; set; }

        /// <summary>
        /// Payment method: CreditCard, PayPal, CashOnDelivery, Wallet
        /// </summary>
        public string PaymentMethod { get; set; } = "CreditCard";

        /// <summary>
        /// Current order status: Pending, Confirmed, Shipped, Delivered, Cancelled
        /// </summary>
        public string Status { get; set; } = "Pending";

        /// <summary>
        /// Optional order notes from customer.
        /// </summary>
        public string? Notes { get; set; }

        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}