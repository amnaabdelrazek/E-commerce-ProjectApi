namespace E_commerce_Project.DTOs
{
    public class SellerDashboardDto
    {
        public decimal TotalEarnings { get; set; }
        public int TotalProducts { get; set; }
        public int OutOfStockCount { get; set; }
        public int PendingOrdersCount { get; set; }
    }
}
