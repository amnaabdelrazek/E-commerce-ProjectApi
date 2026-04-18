using System.ComponentModel.DataAnnotations;

namespace E_commerce_Project.Models
{
    public class Seller : BaseEntity
    {
        public int id { get; set; }
        public string StoreName { get; set; }
        public string StoreDescription { get; set; }
        public bool IsApproved { get; set; } // Admin must approve them
        public decimal Balance { get; set; } // Total money earned
        public string BusinessAddress { get; set; }

        // Link to the Identity User
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }

        // Navigation property
        public ICollection<Product> Products { get; set; }
       
    }
}


