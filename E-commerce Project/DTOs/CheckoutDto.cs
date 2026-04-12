namespace E_commerce_Project.DTOs
{
    public class CheckoutDto
    {
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = "CreditCard";
        public string? PromoCode { get; set; }
        public string? SessionId { get; set; }
        public string? OrderNotes { get; set; }
    }
}
