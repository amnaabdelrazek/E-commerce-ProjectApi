using E_commerce_Project.Data;
using E_commerce_Project.DTOs;
using E_commerce_Project.Models;
using E_commerce_Project.Responses;
using E_commerce_Project.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace E_commerce_Project.Services.Implementations
{
    /// <summary>
    /// Service for managing shopping carts for authenticated users only.
    /// </summary>
    public class CartService : ICartService
    {
        private readonly AppDbContext _context;

        public CartService(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get or create a cart for the authenticated user.
        /// </summary>
        public async Task<GeneralResponse<CartDto>> GetOrCreateCartAsync(string userId)
        {
            try
            {
                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                    .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

                if (cart == null)
                {
                    cart = new Cart
                    {
                        UserId = userId,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Carts.Add(cart);
                    await _context.SaveChangesAsync();
                }

                var cartDto = MapCartToDto(cart);
                return GeneralResponse<CartDto>.Success(cartDto);
            }
            catch (Exception ex)
            {
                return GeneralResponse<CartDto>.Fail($"Error getting/creating cart: {ex.Message}");
            }
        }

        /// <summary>
        /// Add an item to the cart (increases quantity if already exists).
        /// </summary>
        public async Task<GeneralResponse<CartDto>> AddItemToCartAsync(
            int productId, 
            int quantity, 
            string userId)
        {
            try
            {
                // Validate product exists and has sufficient stock
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId && !p.IsDeleted);
                if (product == null)
                    return GeneralResponse<CartDto>.Fail("Product not found");

                if (product.StockQuantity < quantity)
                    return GeneralResponse<CartDto>.Fail($"Insufficient stock. Available: {product.StockQuantity}");

                // Get or create cart
                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                    .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

                if (cart == null)
                {
                    var getOrCreateResult = await GetOrCreateCartAsync(userId);
                    if (!getOrCreateResult.IsSuccess || getOrCreateResult.Data == null)
                        return GeneralResponse<CartDto>.Fail(getOrCreateResult.Message);

                    cart = await _context.Carts
                        .Include(c => c.CartItems)
                        .ThenInclude(ci => ci.Product)
                        .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);
                    
                    if (cart == null)
                        return GeneralResponse<CartDto>.Fail("Failed to create cart");
                }

                // Check if product already in cart
                var existingItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductId == productId && !ci.IsDeleted);

                if (existingItem != null)
                {
                    existingItem.Quantity += quantity;
                    existingItem.LastModifiedAt = DateTime.UtcNow;
                }
                else
                {
                    var cartItem = new CartItem
                    {
                        CartId = cart.Id,
                        ProductId = productId,
                        Quantity = quantity,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.CartItems.Add(cartItem);
                }

                await _context.SaveChangesAsync();

                // Reload cart with updated items
                var updatedCart = await _context.Carts
                    .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                    .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

                if (updatedCart == null)
                    return GeneralResponse<CartDto>.Fail("Failed to retrieve updated cart");

                var cartDto = MapCartToDto(updatedCart);

                return GeneralResponse<CartDto>.Success(cartDto, "Item added to cart successfully");
            }
            catch (Exception ex)
            {
                return GeneralResponse<CartDto>.Fail($"Error adding item to cart: {ex.Message}");
            }
        }

        /// <summary>
        /// Update quantity of an item in cart.
        /// </summary>
        public async Task<GeneralResponse<CartDto>> UpdateCartItemQuantityAsync(
            int cartItemId, 
            int newQuantity, 
            string userId)
        {
            try
            {
                if (newQuantity <= 0)
                    return GeneralResponse<CartDto>.Fail("Quantity must be greater than 0");

                var cartItem = await _context.CartItems
                    .Include(ci => ci.Product)
                    .FirstOrDefaultAsync(ci => ci.Id == cartItemId && !ci.IsDeleted);

                if (cartItem == null)
                    return GeneralResponse<CartDto>.Fail("Cart item not found");

                // Check stock availability
                if (cartItem.Product.StockQuantity < newQuantity)
                    return GeneralResponse<CartDto>.Fail($"Insufficient stock. Available: {cartItem.Product.StockQuantity}");

                cartItem.Quantity = newQuantity;
                cartItem.LastModifiedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                    .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

                if (cart == null)
                    return GeneralResponse<CartDto>.Fail("Cart not found");

                var cartDto = MapCartToDto(cart);

                return GeneralResponse<CartDto>.Success(cartDto, "Quantity updated successfully");
            }
            catch (Exception ex)
            {
                return GeneralResponse<CartDto>.Fail($"Error updating cart item: {ex.Message}");
            }
        }

        /// <summary>
        /// Remove an item from the cart.
        /// </summary>
        public async Task<GeneralResponse<CartDto>> RemoveItemFromCartAsync(
            int cartItemId, 
            string userId)
        {
            try
            {
                var cartItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.Id == cartItemId && !ci.IsDeleted);

                if (cartItem == null)
                    return GeneralResponse<CartDto>.Fail("Cart item not found");

                cartItem.IsDeleted = true;
                cartItem.LastModifiedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                    .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

                if (cart == null)
                    return GeneralResponse<CartDto>.Fail("Cart not found");

                var cartDto = MapCartToDto(cart);

                return GeneralResponse<CartDto>.Success(cartDto, "Item removed from cart");
            }
            catch (Exception ex)
            {
                return GeneralResponse<CartDto>.Fail($"Error removing item from cart: {ex.Message}");
            }
        }

        /// <summary>
        /// Get cart for authenticated user.
        /// </summary>
        public async Task<GeneralResponse<CartDto>> GetUserCartAsync(ClaimsPrincipal userPrincipal)
        {
            try
            {
                var userId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return GeneralResponse<CartDto>.Fail("User not authenticated");

                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                    .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

                if (cart == null)
                {
                    var getOrCreateResult = await GetOrCreateCartAsync(userId);
                    return getOrCreateResult;
                }

                var cartDto = MapCartToDto(cart);
                return GeneralResponse<CartDto>.Success(cartDto);
            }
            catch (Exception ex)
            {
                return GeneralResponse<CartDto>.Fail($"Error getting user cart: {ex.Message}");
            }
        }

        /// <summary>
        /// Clear all items from cart.
        /// </summary>
        public async Task<GeneralResponse<string>> ClearCartAsync(string userId)
        {
            try
            {
                var cart = await _context.Carts
                    .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

                if (cart == null)
                    return GeneralResponse<string>.Fail("Cart not found");

                var cartItems = await _context.CartItems
                    .Where(ci => ci.CartId == cart.Id && !ci.IsDeleted)
                    .ToListAsync();

                foreach (var item in cartItems)
                {
                    item.IsDeleted = true;
                    item.LastModifiedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                return GeneralResponse<string>.Success("", "Cart cleared successfully");
            }
            catch (Exception ex)
            {
                return GeneralResponse<string>.Fail($"Error clearing cart: {ex.Message}");
            }
        }

        /// <summary>
        /// Get cart item count.
        /// </summary>
        public async Task<GeneralResponse<int>> GetCartItemCountAsync(string userId)
        {
            try
            {
                var cart = await _context.Carts
                    .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

                if (cart == null)
                    return GeneralResponse<int>.Success(0);

                var count = await _context.CartItems
                    .Where(ci => ci.CartId == cart.Id && !ci.IsDeleted)
                    .SumAsync(ci => ci.Quantity);

                return GeneralResponse<int>.Success(count);
            }
            catch (Exception ex)
            {
                return GeneralResponse<int>.Fail($"Error getting cart item count: {ex.Message}");
            }
        }

        /// <summary>
        /// Validate that all items in cart have sufficient stock.
        /// </summary>
        public async Task<GeneralResponse<bool>> ValidateCartInventoryAsync(int cartId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Include(ci => ci.Product)
                    .Where(ci => ci.CartId == cartId && !ci.IsDeleted)
                    .ToListAsync();

                foreach (var item in cartItems)
                {
                    if (item.Product.StockQuantity < item.Quantity)
                        return GeneralResponse<bool>.Fail(
                            $"Insufficient stock for {item.Product.Name}. Available: {item.Product.StockQuantity}");
                }

                return GeneralResponse<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return GeneralResponse<bool>.Fail($"Error validating inventory: {ex.Message}");
            }
        }

        /// <summary>
        /// Map Cart entity to CartDto.
        /// </summary>
        private CartDto MapCartToDto(Cart cart)
        {
            return new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                Items = cart.CartItems
                    .Where(ci => !ci.IsDeleted && ci.Product != null)
                    .Select(ci => new CartItemDto
                    {
                        Id = ci.Id,
                        ProductId = ci.ProductId,
                        ProductName = ci.Product.Name,
                        ProductPrice = ci.Product.Price,
                        ProductImageUrl = ci.Product.ImageUrl,
                        Quantity = ci.Quantity
                    })
                    .ToList()
            };
        }
    }
}