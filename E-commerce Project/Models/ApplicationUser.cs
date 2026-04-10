using Microsoft.AspNetCore.Identity;

namespace E_commerce_Project.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
        public string? ProfileImageUrl { get; set; }
        public string? City { get; set; }
        public string? Street { get; set; }
        public string? PaymentCustomerId { get; set; }

        public virtual Cart? Cart { get; set; } 
        public virtual ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}