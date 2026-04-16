    using System.ComponentModel.DataAnnotations;
namespace E_commerce_Project.DTOs
{

    public class RegisterDto
    {
        [Required]
        [MinLength(3)]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Role { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }
    }
}
