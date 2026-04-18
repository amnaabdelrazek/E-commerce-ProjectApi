using E_commerce_Project.DTOs;
using E_commerce_Project.Models;
using E_commerce_Project.Repositories.Interfaces;
using E_commerce_Project.Responses;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace E_commerce_Project.Services.Implementations
{
    public class ProductService : IProductService
    {
        private readonly IGenericRepository<Product> _repo;
        private readonly UserManager<ApplicationUser> _userManager;

        public ProductService(IGenericRepository<Product> repo,
                              UserManager<ApplicationUser> userManager)
        {
            _repo = repo;
            _userManager = userManager;
        }

        // ================= CREATE =================
        public async Task<GeneralResponse<string>> CreateProductAsync(ClaimsPrincipal userPrincipal, CreateProductDto dto)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);

            if (user == null)
                return GeneralResponse<string>.Fail("User not found");

            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                StockQuantity = dto.StockQuantity,
                CategoryId = dto.CategoryId,
                SellerId = user.Id
            };

            await _repo.AddAsync(product);
            await _repo.SaveAsync();

            return GeneralResponse<string>.Success("Product created");
        }

        // ================= UPDATE =================
        public async Task<GeneralResponse<string>> UpdateProductAsync(int id, UpdateProductDto dto)
        {
            var product = await _repo.GetByIdAsync(id);

            if (product == null)
                return GeneralResponse<string>.Fail("Product not found");

            product.Name = dto.Name ?? product.Name;
            product.Description = dto.Description ?? product.Description;
            product.Price = dto.Price ?? product.Price;
            product.StockQuantity = dto.StockQuantity ?? product.StockQuantity;
            product.CategoryId = dto.CategoryId ?? product.CategoryId;

            _repo.Update(product);
            await _repo.SaveAsync();

            return GeneralResponse<string>.Success("Product updated");
        }

        // ================= DELETE =================
        public async Task<GeneralResponse<string>> DeleteProductAsync(int id)
        {
            var product = await _repo.GetByIdAsync(id);

            if (product == null)
                return GeneralResponse<string>.Fail("Product not found");

            _repo.Delete(product);
            await _repo.SaveAsync();

            return GeneralResponse<string>.Success("Product deleted");
        }

        // Services/Implementations/ProductService.cs
        public async Task<GeneralResponse<object>> GetAllProductsAsync(ProductFilterDto filter)
        {
            IQueryable<Product> query = _repo.Query()
                .AsNoTracking()
                .Include(p => p.Category);

            // ================= FILTER =================
            if (!string.IsNullOrEmpty(filter.Name))
                query = query.Where(p => p.Name.Contains(filter.Name));

            if (filter.CategoryId.HasValue)
                query = query.Where(p => p.CategoryId == filter.CategoryId);

            if (filter.MinPrice.HasValue)
                query = query.Where(p => p.Price >= filter.MinPrice);

            if (filter.MaxPrice.HasValue)
                query = query.Where(p => p.Price <= filter.MaxPrice);

            // ================= SORTING =================
            if (filter.SortBy?.ToLower() == "price")
            {
                query = filter.SortDirection == "desc"
                    ? query.OrderByDescending(p => p.Price)
                    : query.OrderBy(p => p.Price);
            }
            else if (filter.SortBy?.ToLower() == "name")
            {
                query = filter.SortDirection == "desc"
                    ? query.OrderByDescending(p => p.Name)
                    : query.OrderBy(p => p.Name);
            }

            // ================= PAGINATION =================
            var totalCount = await query.CountAsync();

            var products = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(p => new ProductListDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    StockQuantity = p.StockQuantity,
                    ImageUrl = p.ImageUrl,
                    CategoryName = p.Category.Name
                })
                .ToListAsync();

            return GeneralResponse<object>.Success(new
            {
                TotalCount = totalCount,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize,
                Data = products
            });
        }
        // ================= GET BY ID =================
        public async Task<GeneralResponse<object>> GetProductByIdAsync(int id)
        {
            var product = await _repo.Query()
                .Include(p => p.Category)
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return GeneralResponse<object>.Fail("Product not found");

            var dto = new ProductListDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                ImageUrl = product.ImageUrl,
                CategoryName = product.Category.Name
            };

            return GeneralResponse<object>.Success(dto);
        }

        public async Task<GeneralResponse<string>> UploadProductImageAsync(int productId, ClaimsPrincipal userPrincipal, IFormFile file)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);

            if (user == null)
                return GeneralResponse<string>.Fail("User not found");

            var product = await _repo.GetByIdAsync(productId);

            if (product == null)
                return GeneralResponse<string>.Fail("Product not found");

            //// 🔐 تأكد إن صاحب المنتج
            //if (product.SellerId != user.Id)
            //    return GeneralResponse<string>.Fail("Unauthorized");

            if (file == null || file.Length == 0)
                return GeneralResponse<string>.Fail("Invalid file");

            var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/products");

            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var path = Path.Combine(folder, fileName);

            using (var stream = new FileStream(path, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            product.ImageUrl = "/images/products/" + fileName;

            _repo.Update(product);
            await _repo.SaveAsync();

            return GeneralResponse<string>.Success(product.ImageUrl);
        }
    }
}