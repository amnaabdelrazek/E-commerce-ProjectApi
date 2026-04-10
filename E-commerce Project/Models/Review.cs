namespace E_commerce_Project.Models
{
    public class Review
    {
        public int Id { get; set; }

        public string UserId { get; set; }
        public ApplicationUser User { get; set; }

        public int ProductId { get; set; }

        public int Rating { get; set; }
        public string Comment { get; set; }
    }
}
