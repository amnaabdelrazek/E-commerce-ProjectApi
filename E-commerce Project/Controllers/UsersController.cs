using E_commerce_Project.DTOs;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace E_commerce_Project.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }
       

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            if (User == null || !User.Identity.IsAuthenticated)
                return Unauthorized("User not authenticated");

            var result = await _userService.GetProfileAsync(User);

            return Ok(result);
        }
        [Authorize]
        [HttpPut("profile")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDto dto)
            => Ok(await _userService.UpdateProfileAsync(User, dto));

        [Authorize]
        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
            => Ok(await _userService.UploadImageAsync(User, file));

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
            => Ok(await _userService.ChangePasswordAsync(User, dto));
    }
}
