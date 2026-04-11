using E_commerce_Project.DTOs;
using E_commerce_Project.Responses;
using System.Security.Claims;

namespace E_commerce_Project.Services.Interfaces
{
    public interface IProductService
    {
        Task<GeneralResponse<string>> CreateProductAsync(ClaimsPrincipal user, CreateProductDto dto);
        Task<GeneralResponse<string>> UpdateProductAsync(int id, UpdateProductDto dto);
        Task<GeneralResponse<string>> DeleteProductAsync(int id);
        Task<GeneralResponse<object>> GetAllProductsAsync(ProductFilterDto filter);
        Task<GeneralResponse<object>> GetProductByIdAsync(int id);
        Task<GeneralResponse<string>> UploadProductImageAsync(int productId, ClaimsPrincipal userPrincipal, IFormFile file);

    }
}