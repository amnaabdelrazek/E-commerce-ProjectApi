using E_commerce_Project.DTOs;
using E_commerce_Project.Services.Implementations;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace E_commerce_Project.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _service;

        public ProductsController(IProductService service)
        {
            _service = service;
        }

        // ================= CREATE =================
        [Authorize(Roles = "Seller,Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateProductDto dto)
            => Ok(await _service.CreateProductAsync(User, dto));


        [Authorize]
        [HttpPost("{id}/upload-image")]
        public async Task<IActionResult> UploadImage(int id, IFormFile file)
        {
            var result = await _service.UploadProductImageAsync(id, User, file);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        // ================= UPDATE =================
        [Authorize(Roles = "Seller,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateProductDto dto)
            => Ok(await _service.UpdateProductAsync(id, dto));

        // ================= DELETE =================
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
            => Ok(await _service.DeleteProductAsync(id));

        // ================= GET ALL =================
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ProductFilterDto filter)
            => Ok(await _service.GetAllProductsAsync(filter));

        // ================= GET BY ID =================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
            => Ok(await _service.GetProductByIdAsync(id));
    }
}