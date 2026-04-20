namespace E_commerce_Project.Hubs
{
    public static class CommerceHubGroups
    {
        public static string User(string userId) => $"user:{userId}";
        public static string Role(string role) => $"role:{role.ToLowerInvariant()}";
        public static string Product(int productId) => $"product:{productId}";
    }
}
