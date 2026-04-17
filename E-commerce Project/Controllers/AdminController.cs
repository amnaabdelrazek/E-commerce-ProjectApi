using E_commerce_Project.DTOs;
using E_commerce_Project.Responses;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace E_commerce_Project.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IOrderService _orderService;

        public AdminController(IAdminService adminService, IOrderService orderService)
        {
            _adminService = adminService;
            _orderService = orderService;
        }

     
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
            => Ok(await _adminService.GetAllUsersAsync());

        [HttpPost("lock/{id}")]
        public async Task<IActionResult> Lock(string id)
        {
            var response = await _adminService.LockUserAsync(id);
            return ToActionResult(response);
        }

        [HttpPost("unlock/{id}")]
        public async Task<IActionResult> Unlock(string id)
        {
            var response = await _adminService.UnlockUserAsync(id);
            return ToActionResult(response);
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> SoftDeleteUser(string id)
        {
            var response = await _adminService.SoftDeleteUserAsync(id);
            return ToActionResult(response);
        }

        [HttpPost("role")]
        public async Task<IActionResult> ChangeRole([FromBody] UpdateUserRoleDto dto)
        {
            var response = await _adminService.ChangeUserRoleAsync(dto.UserId, dto.NewRole);
            return ToActionResult(response);
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetOrders()
            => Ok(await _adminService.GetAllOrdersAsync());

        [HttpPut("orders/{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status)
        {
            var response = await _orderService.UpdateOrderStatusAsync(id, status);
            return ToActionResult(response);
        }

        [HttpPost("coupons")]
        public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponDto dto)
        {
            var response = await _adminService.CreateCouponAsync(dto);
            return ToActionResult(response, StatusCodes.Status201Created);
        }

        [HttpGet("coupons")]
        public async Task<IActionResult> GetCoupons()
            => Ok(await _adminService.GetAllCouponsAsync());

        [HttpDelete("coupons/{id}")]
        public async Task<IActionResult> DeleteCoupon(int id)
        {
            var response = await _adminService.DeleteCouponAsync(id);
            return ToActionResult(response);
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> Dashboard()
            => Ok(await _adminService.GetDashboardAsync());

        private IActionResult ToActionResult<T>(GeneralResponse<T> response, int successStatusCode = StatusCodes.Status200OK)
        {
            if (response.IsSuccess)
                return StatusCode(successStatusCode, response);

            var message = response.Message.ToLowerInvariant();
            if (message.Contains("not found"))
                return NotFound(response);
            if (message.Contains("unauthorized"))
                return Unauthorized(response);
            if (message.Contains("forbidden"))
                return StatusCode(StatusCodes.Status403Forbidden, response);
            if (message.Contains("already exists"))
                return Conflict(response);

            return BadRequest(response);
        }
    }
}
