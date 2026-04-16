using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace E_commerce_Project.Models
{
    public class Content : BaseEntity
    {
        [Required]
        [StringLength(50)]
        public string Type { get; set; } // "banner", "promo", "section", etc.

        [Required]
        [StringLength(100)]
        public string Title { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public string ImageUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public int DisplayOrder { get; set; } = 0;

        public DateTime StartDate { get; set; } = DateTime.UtcNow;

        public DateTime? EndDate { get; set; }

        [StringLength(255)]
        public string TargetUrl { get; set; }

        // For banners targeting specific categories/products
        public int? CategoryId { get; set; }
        public int? ProductId { get; set; }
    }
}
