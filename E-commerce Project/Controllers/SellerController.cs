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
    [Authorize] // Only sellers can access this controller
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

            if (!profileDto.IsApproved)
                return Forbid();

            return Ok(profileDto);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateSellerProfileDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var profile = await _sellerService.GetSellerProfileAsync(userId);

            if (profile == null)
                return NotFound(new { message = "Seller profile not found." });

            if (!profile.IsApproved)
                return Forbid();

            var success = await _sellerService.UpdateSellerProfileAsync(userId, dto);

            if (!success)
                return BadRequest(new { message = "Failed to update profile." });

            return Ok(new { message = "Profile updated successfully." });
        }
        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetStats()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var seller = await _sellerService.GetSellerProfileAsync(userId);

            if (seller == null)
                return Forbid("You are not a seller");

            if (!seller.IsApproved)
                return Forbid("Seller account not approved");

            var result = await _sellerService.GetDashboardStatsAsync(User);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }
    }
}
