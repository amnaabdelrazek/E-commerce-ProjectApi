    using System.ComponentModel.DataAnnotations;
namespace E_commerce_Project.DTOs
{

    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
