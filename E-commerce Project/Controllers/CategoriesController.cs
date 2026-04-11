using E_commerce_Project.DTOs;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace E_commerce_Project.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _service;

        public CategoriesController(ICategoryService service)
        {
            _service = service;
        }

        // ================= CREATE =================
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateCategoryDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        // ================= UPDATE =================
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateCategoryDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        // ================= DELETE =================
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        // ================= GET ALL =================
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] CategoryFilterDto filter)
            => Ok(await _service.GetAllAsync(filter));

        // ================= GET BY ID =================
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
            => Ok(await _service.GetByIdAsync(id));

        // ================= UPLOAD IMAGE =================
        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/upload-image")]
        public async Task<IActionResult> UploadImage(int id, IFormFile file)
        {
            var result = await _service.UploadImageAsync(id, file);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }
    }
}