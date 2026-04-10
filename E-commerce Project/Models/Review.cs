namespace E_commerce_Project.Models
{
    public class Review : BaseEntity
    {
        public int Id { get; set; }

        public string UserId { get; set; }
        public virtual ApplicationUser User { get; set; }

        public int ProductId { get; set; }
        public virtual Product Product { get; set; }

        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }
}
