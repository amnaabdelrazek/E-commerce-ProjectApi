namespace E_commerce_Project.Hubs
{
    public static class CommerceHubEvents
    {
        public const string ReviewsChanged = "reviews.changed";
        public const string UserReviewsChanged = "user-reviews.changed";
        public const string CartChanged = "cart.changed";
        public const string WishlistChanged = "wishlist.changed";
        public const string OrdersChanged = "orders.changed";
        public const string ProductInventoryChanged = "product-inventory.changed";
        public const string AdminDashboardChanged = "admin-dashboard.changed";
        public const string AdminOrdersChanged = "admin-orders.changed";
        public const string AdminCouponsChanged = "admin-coupons.changed";
        public const string AdminUsersChanged = "admin-users.changed";
        public const string AdminSellersChanged = "admin-sellers.changed";
        public const string SellerDashboardChanged = "seller-dashboard.changed";
    }
}
