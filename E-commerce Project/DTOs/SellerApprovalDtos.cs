using System.ComponentModel.DataAnnotations;

namespace E_commerce_Project.DTOs
{
    public class SellerApprovalDtos
    {
        public class PendingSellerDto
        {
            public int Id { get; set; }
            public string UserId { get; set; }
            public string UserEmail { get; set; }
            public string UserFullName { get; set; }
            public string StoreName { get; set; }
            public string StoreDescription { get; set; }
            public string BusinessAddress { get; set; }
            public bool IsApproved { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        // DTO for admin response to approve/reject seller
        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public class ApproveSeller
        {
            [Required]
            public int SellerId { get; set; }

            [Required]
            public bool IsApproved { get; set; }

            public string RejectionReason { get; set; } // Optional: reason for rejection
        }

        // DTO for seller info summary
        public class SellerApprovalStatusDto
        {
            public int SellerId { get; set; }
            public string StoreName { get; set; }
            public string UserEmail { get; set; }
            public bool IsApproved { get; set; }
            public string Status => IsApproved ? "Approved" : "Pending";
        }
    }
}
