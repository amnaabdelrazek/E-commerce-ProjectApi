using E_commerce_Project.DTOs.Admin;

namespace E_commerce_Project.DTOs
{
    public class AdminDashboardDto
    {
        public int TotalUsers { get; set; }
        public int TotalOrders { get; set; }
        public int TotalProducts { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalCoupons { get; set; }  
        public int PendingOrders { get; set; }
        public int ActiveUsers { get; set; }

        public List<MonthlyRevenueDto> MonthlyRevenue { get; set; } = new();
        public List<TopProductDto> TopProducts { get; set; } = new();
        public List<TopBuyerDto> TopBuyers { get; set; } = new(); 
    }
}