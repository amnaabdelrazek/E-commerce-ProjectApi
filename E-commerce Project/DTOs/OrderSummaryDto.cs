namespace E_commerce_Project.DTOs
{
    public class OrderSummaryDto
    {
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public string? AppliedPromoCode { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal FreeShippingThreshold { get; set; } = 100m;
        public decimal TaxRate { get; set; } = 0.10m;
        public decimal Total => SubTotal - DiscountAmount + TaxAmount + ShippingCost;
    }
}
