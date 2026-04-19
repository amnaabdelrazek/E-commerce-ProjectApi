using E_commerce_Project.DTOs;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace E_commerce_Project.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;

        public AuthController(IAuthService auth)
        {
            _auth = auth;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var result = await _auth.RegisterAsync(dto);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var result = await _auth.LoginAsync(dto);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            var result = await _auth.ConfirmEmailAsync(userId, token);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost("register-seller")]
        public async Task<IActionResult> RegisterSeller([FromBody] RegisterSellerDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _auth.RegisterSellerAsync(model);
            //new
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }
    }
}