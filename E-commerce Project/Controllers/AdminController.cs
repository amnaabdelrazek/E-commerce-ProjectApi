using E_commerce_Project.DTOs;
using E_commerce_Project.DTOs.Admin;
using E_commerce_Project.Responses;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static E_commerce_Project.DTOs.SellerApprovalDtos;

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

        // ==================== USER MANAGEMENT ====================

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

        // ==================== COUPON MANAGEMENT ====================

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

        // ==================== ORDER MANAGEMENT ====================

        [HttpGet("orders")]
        public async Task<IActionResult> GetOrders()
            => Ok(await _adminService.GetAllOrdersAsync());

        [HttpPut("orders/{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status)
        {
            var response = await _orderService.UpdateOrderStatusAsync(id, status);
            return ToActionResult(response);
        }

        // ==================== SELLER APPROVAL MANAGEMENT ====================

        /// <summary>
        /// Get all pending sellers waiting for admin approval
        /// </summary>
        [HttpGet("sellers/pending")]
        public async Task<IActionResult> GetPendingSellers()
        {
            var pendingSellers = await _adminService.GetPendingSellersAsync();
            return Ok(GeneralResponse<IEnumerable<PendingSellerDto>>.Success(pendingSellers));
        }

        /// <summary>
        /// Get all sellers (both approved and pending)
        /// </summary>
        [HttpGet("sellers")]
        public async Task<IActionResult> GetAllSellers()
        {
            var sellers = await _adminService.GetAllSellersAsync();
            return Ok(GeneralResponse<IEnumerable<SellerApprovalStatusDto>>.Success(sellers));
        }

        /// <summary>
        /// Get detailed information about a specific seller
        /// </summary>
        [HttpGet("sellers/{id}")]
        public async Task<IActionResult> GetSellerDetails(int id)
        {
            var seller = await _adminService.GetSellerDetailsAsync(id);
            if (seller == null)
                return NotFound(GeneralResponse<object>.Fail("Seller not found"));

            return Ok(GeneralResponse<PendingSellerDto>.Success(seller));
        }

        /// <summary>
        /// Approve a seller account
        /// </summary>
        [HttpPost("sellers/{id}/approve")]
        public async Task<IActionResult> ApproveSeller(int id)
        {
            var response = await _adminService.ApproveSellersAsync(id, true);
            return ToActionResult(response);
        }

        /// <summary>
        /// Reject a seller account
        /// </summary>
        [HttpPost("sellers/{id}/reject")]
        public async Task<IActionResult> RejectSeller(int id)
        {
            var response = await _adminService.ApproveSellersAsync(id, false);
            return ToActionResult(response);
        }

        /// <summary>
        /// Approve or reject multiple sellers
        /// </summary>
        [HttpPost("sellers/batch-approval")]
        public async Task<IActionResult> BatchApproveSellers([FromBody] List<ApproveSeller> approvals)
        {
            if (approvals == null || !approvals.Any())
                return BadRequest(GeneralResponse<object>.Fail("No sellers provided"));

            var results = new List<object>();

            foreach (var approval in approvals)
            {
                var response = await _adminService.ApproveSellersAsync(approval.SellerId, approval.IsApproved);
                results.Add(new
                {
                    SellerId = approval.SellerId,
                    Success = response.IsSuccess,
                    Message = response.Message
                });
            }

            return Ok(GeneralResponse<List<object>>.Success(results, "Batch approval processed"));
        }

        // ==================== DASHBOARD ====================

        [HttpGet("dashboard")]
        public async Task<IActionResult> Dashboard()
        {
            var data = await _adminService.GetDashboardAsync();
            return Ok(GeneralResponse<AdminDashboardDto>.Success(data));
        }

        // ==================== HELPER METHODS ====================

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