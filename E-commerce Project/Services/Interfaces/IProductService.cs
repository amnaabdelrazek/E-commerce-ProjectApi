using E_commerce_Project.DTOs;
using E_commerce_Project.Responses;
using System.Security.Claims;

namespace E_commerce_Project.Services.Interfaces
{
    public interface IProductService
    {
        Task<GeneralResponse<string>> CreateProductAsync(ClaimsPrincipal user, CreateProductDto dto);
        Task<GeneralResponse<string>> UpdateProductAsync(int id,ClaimsPrincipal user, UpdateProductDto dto);
        Task<GeneralResponse<string>> DeleteProductAsync(int id, ClaimsPrincipal user);
        Task<GeneralResponse<object>> GetAllProductsAsync(ProductFilterDto filter);
        Task<GeneralResponse<object>> GetProductByIdAsync(int id);
        Task<GeneralResponse<string>> UploadProductImageAsync(int productId, ClaimsPrincipal userPrincipal, IFormFile file);

        // For Seller to see only their items
        Task<GeneralResponse<List<ProductListDto>>> GetSellerInventoryAsync(ClaimsPrincipal userPrincipal);

        // For Seller to quickly change stock numbers
        Task<GeneralResponse<string>> UpdateStockAsync(int id, ClaimsPrincipal userPrincipal, int newQuantity);
    }
}