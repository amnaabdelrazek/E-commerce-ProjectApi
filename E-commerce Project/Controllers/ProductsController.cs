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


        [Authorize(Roles = "Seller,Admin")]
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
     // Pass 'User' so service can check ownership
     => Ok(await _service.UpdateProductAsync(id, User, dto));



        // ================= DELETE =================
        [Authorize(Roles = "Seller,Admin")] // Sellers should be able to delete their own items!
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
     => Ok(await _service.DeleteProductAsync(id, User));



        // ================= GET ALL for customer =================
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ProductFilterDto filter)
            => Ok(await _service.GetAllProductsAsync(filter));



        // ================= GET BY ID =================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
            => Ok(await _service.GetProductByIdAsync(id));


        //===========  Get all product for the seller  ===================
        [Authorize(Roles = "Seller")]
        [HttpGet("my-inventory")]
        public async Task<IActionResult> GetMyInventory()
       => Ok(await _service.GetSellerInventoryAsync(User));


        //============ update stock quantity  ================

        [Authorize(Roles = "Seller")]
        [HttpPatch("{id}/update-stock")]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] int newQuantity)
    => Ok(await _service.UpdateStockAsync(id, User, newQuantity));
    }
}