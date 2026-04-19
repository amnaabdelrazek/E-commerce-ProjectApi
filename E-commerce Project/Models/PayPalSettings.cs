namespace E_commerce_Project.Models
{
    public class PayPalSettings
    {
        public string ClientId { get; set; }
        public string Secret { get; set; }
        public string Mode { get; set; } // sandbox
        public string FrontendUrl { get; set; } = "http://localhost:4200"; // Configurable frontend URL
    }
}
