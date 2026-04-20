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
        private readonly IRealtimeNotifier _realtimeNotifier;

        public CartService(AppDbContext context, IRealtimeNotifier realtimeNotifier)
        {
            _context = context;
            _realtimeNotifier = realtimeNotifier;
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
                if (quantity <= 0)
                    return GeneralResponse<CartDto>.Fail("Quantity must be greater than 0");

                // Validate product exists and has sufficient stock
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId && !p.IsDeleted);
                if (product == null)
                    return GeneralResponse<CartDto>.Fail("Product not found");

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

                if (product.StockQuantity < quantity)
                    return GeneralResponse<CartDto>.Fail($"Insufficient stock. Available: {product.StockQuantity}");

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

                product.StockQuantity -= quantity;
                await _context.SaveChangesAsync();

                // Reload cart with updated items
                var updatedCart = await _context.Carts
                    .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                    .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

                if (updatedCart == null)
                    return GeneralResponse<CartDto>.Fail("Failed to retrieve updated cart");

                var cartDto = MapCartToDto(updatedCart);
                await NotifyCartChangedAsync(userId, cartDto);
                await _realtimeNotifier.NotifyProductInventoryChangedAsync(product.Id, product.StockQuantity);
                await _realtimeNotifier.NotifySellerDashboardChangedAsync(
                    await GetSellerUserIdsForProductsAsync(new[] { product.Id }),
                    "inventory-reserved");

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
                    .Include(ci => ci.Cart)
                    .FirstOrDefaultAsync(ci => ci.Id == cartItemId && !ci.IsDeleted);

                if (cartItem == null)
                    return GeneralResponse<CartDto>.Fail("Cart item not found");

                if (cartItem.Cart?.UserId != userId)
                    return GeneralResponse<CartDto>.Fail("Unauthorized");

                var delta = newQuantity - cartItem.Quantity;
                if (delta > 0 && cartItem.Product.StockQuantity < delta)
                    return GeneralResponse<CartDto>.Fail($"Insufficient stock. Available: {cartItem.Product.StockQuantity}");

                cartItem.Product.StockQuantity -= delta;

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
                await NotifyCartChangedAsync(userId, cartDto);
                await _realtimeNotifier.NotifyProductInventoryChangedAsync(cartItem.ProductId, cartItem.Product.StockQuantity);
                await _realtimeNotifier.NotifySellerDashboardChangedAsync(
                    await GetSellerUserIdsForProductsAsync(new[] { cartItem.ProductId }),
                    "inventory-updated");

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
                    .Include(ci => ci.Product)
                    .Include(ci => ci.Cart)
                    .FirstOrDefaultAsync(ci => ci.Id == cartItemId && !ci.IsDeleted);

                if (cartItem == null)
                    return GeneralResponse<CartDto>.Fail("Cart item not found");

                if (cartItem.Cart?.UserId != userId)
                    return GeneralResponse<CartDto>.Fail("Unauthorized");

                if (cartItem.Product != null)
                {
                    cartItem.Product.StockQuantity += cartItem.Quantity;
                }

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
                await NotifyCartChangedAsync(userId, cartDto);
                if (cartItem.Product != null)
                {
                    await _realtimeNotifier.NotifyProductInventoryChangedAsync(cartItem.ProductId, cartItem.Product.StockQuantity);
                    await _realtimeNotifier.NotifySellerDashboardChangedAsync(
                        await GetSellerUserIdsForProductsAsync(new[] { cartItem.ProductId }),
                        "inventory-released");
                }

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
        public async Task<GeneralResponse<string>> ClearCartAsync(string userId, bool restoreStock = true)
        {
            try
            {
                var cart = await _context.Carts
                    .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

                if (cart == null)
                    return GeneralResponse<string>.Fail("Cart not found");

                var cartItems = await _context.CartItems
                    .Include(ci => ci.Product)
                    .Where(ci => ci.CartId == cart.Id && !ci.IsDeleted)
                    .ToListAsync();

                foreach (var item in cartItems)
                {
                    if (restoreStock && item.Product != null)
                    {
                        item.Product.StockQuantity += item.Quantity;
                    }

                    item.IsDeleted = true;
                    item.LastModifiedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                await _realtimeNotifier.NotifyCartChangedAsync(userId, 0);

                if (restoreStock)
                {
                    var productIds = cartItems
                        .Select(ci => ci.ProductId)
                        .Distinct()
                        .ToList();

                    foreach (var item in cartItems.Where(ci => ci.Product != null))
                    {
                        await _realtimeNotifier.NotifyProductInventoryChangedAsync(item.ProductId, item.Product!.StockQuantity);
                    }

                    await _realtimeNotifier.NotifySellerDashboardChangedAsync(
                        await GetSellerUserIdsForProductsAsync(productIds),
                        "inventory-released");
                }

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
                    if (item.Product == null || item.Product.IsDeleted)
                        return GeneralResponse<bool>.Fail("One of the products in your cart is no longer available");

                    if (item.Quantity <= 0)
                        return GeneralResponse<bool>.Fail("Cart contains an invalid item quantity");
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

        private Task NotifyCartChangedAsync(string userId, CartDto cartDto)
        {
            var count = cartDto.Items.Sum(item => item.Quantity);
            return _realtimeNotifier.NotifyCartChangedAsync(userId, count);
        }

        private async Task<List<string>> GetSellerUserIdsForProductsAsync(IEnumerable<int> productIds)
        {
            var ids = productIds
                .Where(id => id > 0)
                .Distinct()
                .ToList();

            if (ids.Count == 0)
            {
                return new List<string>();
            }

            return await _context.Products
                .Where(product => ids.Contains(product.Id))
                .Join(
                    _context.Sellers,
                    product => product.SellerId,
                    seller => seller.id,
                    (_, seller) => seller.UserId)
                .Distinct()
                .ToListAsync();
        }
    }
}
