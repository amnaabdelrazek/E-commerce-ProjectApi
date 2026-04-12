using E_commerce_Project.DTOs;
using E_commerce_Project.Responses;
using System.Security.Claims;

namespace E_commerce_Project.Services.Interfaces
{
    /// <summary>
    /// Interface for cart management operations (authenticated users only).
    /// </summary>
    public interface ICartService
    {
        /// <summary>
        /// Get or create a cart for the authenticated user.
        /// </summary>
        Task<GeneralResponse<CartDto>> GetOrCreateCartAsync(string userId);

        /// <summary>
        /// Add an item to the cart. Increases quantity if item already exists.
        /// </summary>
        Task<GeneralResponse<CartDto>> AddItemToCartAsync(int productId, int quantity, string userId);

        /// <summary>
        /// Update the quantity of an item in the cart.
        /// </summary>
        Task<GeneralResponse<CartDto>> UpdateCartItemQuantityAsync(int cartItemId, int newQuantity, string userId);

        /// <summary>
        /// Remove an item from the cart.
        /// </summary>
        Task<GeneralResponse<CartDto>> RemoveItemFromCartAsync(int cartItemId, string userId);

        /// <summary>
        /// Get the current cart for authenticated user.
        /// </summary>
        Task<GeneralResponse<CartDto>> GetUserCartAsync(ClaimsPrincipal userPrincipal);

        /// <summary>
        /// Clear all items from the cart.
        /// </summary>
        Task<GeneralResponse<string>> ClearCartAsync(string userId);

        /// <summary>
        /// Get cart item count.
        /// </summary>
        Task<GeneralResponse<int>> GetCartItemCountAsync(string userId);

        /// <summary>
        /// Validate that all items in cart have sufficient stock.
        /// </summary>
        Task<GeneralResponse<bool>> ValidateCartInventoryAsync(int cartId);
    }
}
