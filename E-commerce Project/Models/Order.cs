namespace E_commerce_Project.Models
{
    public class Order : BaseEntity
    {
        public int Id { get; set; }

        public string UserId { get; set; }
        public virtual ApplicationUser User { get; set; }

        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = "Pending";


        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}