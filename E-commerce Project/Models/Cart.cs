namespace E_commerce_Project.Models
{
    public class Cart : BaseEntity
    {
        public int Id { get; set; }

        /// <summary>
        /// User ID (required - authenticated users only).
        /// </summary>
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; }

        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}
