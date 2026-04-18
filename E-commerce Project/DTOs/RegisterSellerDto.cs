namespace E_commerce_Project.DTOs
{
    public class RegisterSellerDto
    {
        public string FullName { get; set; } // Matches your base user registration
        public string Email { get; set; }
        public string Password { get; set; }
        public string StoreName { get; set; }
    }
}
