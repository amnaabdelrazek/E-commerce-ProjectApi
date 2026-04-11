using E_commerce_Project.DTOs;
using E_commerce_Project.Models;
using E_commerce_Project.Repositories.Interfaces;
using E_commerce_Project.Responses;
using E_commerce_Project.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace E_commerce_Project.Services.Implementations
{
    public class CategoryService : ICategoryService
    {
        private readonly IGenericRepository<Category> _repo;

        public CategoryService(IGenericRepository<Category> repo)
        {
            _repo = repo;
        }

        // ================= CREATE =================
        public async Task<GeneralResponse<string>> CreateAsync(CreateCategoryDto dto)
        {
            var category = new Category
            {
                Name = dto.Name,
                Description = dto.Description
            };

            await _repo.AddAsync(category);
            await _repo.SaveAsync();

            return GeneralResponse<string>.Success("Category created");
        }

        // ================= UPDATE =================
        public async Task<GeneralResponse<string>> UpdateAsync(int id, UpdateCategoryDto dto)
        {
            var category = await _repo.GetByIdAsync(id);

            if (category == null)
                return GeneralResponse<string>.Fail("Category not found");

            category.Name = dto.Name ?? category.Name;
            category.Description = dto.Description ?? category.Description;

            _repo.Update(category);
            await _repo.SaveAsync();

            return GeneralResponse<string>.Success("Category updated");
        }

        // ================= DELETE (PREVENT PRODUCTS) =================
        public async Task<GeneralResponse<string>> DeleteAsync(int id)
        {
            var category = await _repo.Query()
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return GeneralResponse<string>.Fail("Category not found");

            if (category.Products.Any())
                return GeneralResponse<string>.Fail("Cannot delete category that has products");

            _repo.Delete(category);
            await _repo.SaveAsync();

            return GeneralResponse<string>.Success("Category deleted");
        }

        // ================= GET ALL (FILTER + PAGINATION + COUNT) =================
        public async Task<GeneralResponse<object>> GetAllAsync(CategoryFilterDto filter)
        {
            var query = _repo.Query()
                .Include(c => c.Products)
                .AsQueryable();

            // 🔍 FILTER
            if (!string.IsNullOrWhiteSpace(filter.Name))
                query = query.Where(c => c.Name.Contains(filter.Name));

            var totalItems = await query.CountAsync();

            var categories = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    ImageUrl = c.ImageUrl,
                    ProductsCount = c.Products.Count
                })
                .ToListAsync();

            return GeneralResponse<object>.Success(new
            {
                totalItems,
                page = filter.Page,
                pageSize = filter.PageSize,
                data = categories
            });
        }

        // ================= GET BY ID =================
        public async Task<GeneralResponse<object>> GetByIdAsync(int id)
        {
            var category = await _repo.Query()
                .Include(c => c.Products)
                .Where(c => c.Id == id)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    ImageUrl = c.ImageUrl,
                    ProductsCount = c.Products.Count
                })
                .FirstOrDefaultAsync();

            if (category == null)
                return GeneralResponse<object>.Fail("Category not found");

            return GeneralResponse<object>.Success(category);
        }

        // ================= UPLOAD IMAGE =================
        public async Task<GeneralResponse<string>> UploadImageAsync(int id, IFormFile file)
        {
            var category = await _repo.GetByIdAsync(id);

            if (category == null)
                return GeneralResponse<string>.Fail("Category not found");

            if (file == null || file.Length == 0)
                return GeneralResponse<string>.Fail("Invalid file");

            var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/categories");

            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var path = Path.Combine(folder, fileName);

            using (var stream = new FileStream(path, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            category.ImageUrl = "/images/categories/" + fileName;

            _repo.Update(category);
            await _repo.SaveAsync();

            return GeneralResponse<string>.Success(category.ImageUrl);
        }
    }
}