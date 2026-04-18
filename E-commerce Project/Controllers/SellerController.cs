using E_commerce_Project.DTOs;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace E_commerce_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Seller")] // Only sellers can access this controller
    public class SellerController : ControllerBase
    {
        private readonly ISellerService _sellerService;

        public SellerController(ISellerService sellerService)
        {
            _sellerService = sellerService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var profileDto = await _sellerService.GetSellerProfileAsync(userId);

            if (profileDto == null) 
                return NotFound(new { message = "Seller profile not found." });

            return Ok(profileDto); // Note: In production, return an output DTO here, not the raw entity
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateSellerProfileDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var success = await _sellerService.UpdateSellerProfileAsync(userId, dto);

            if (!success) 
                return BadRequest(new { message = "Failed to update profile or profile not found." });

            return Ok(new { message = "Profile updated successfully." });
        }
        [Authorize(Roles = "Seller")]
        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetStats()
        {
            var result = await _sellerService.GetDashboardStatsAsync(User);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }
    }
}
