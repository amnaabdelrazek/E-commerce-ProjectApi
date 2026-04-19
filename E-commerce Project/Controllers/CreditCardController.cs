using E_commerce_Project.Controllers.Payment;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace E_commerce_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CreditCardController : ControllerBase
    {
        private readonly ICreditCardService _creditCardService;
        private readonly ILogger<CreditCardController> _logger;

        public CreditCardController(ICreditCardService creditCardService, ILogger<CreditCardController> logger)
        {
            _creditCardService = creditCardService;
            _logger = logger;
        }

        // ================= PROCESS CREDIT CARD PAYMENT =================
        [Authorize]
        [HttpPost("process")]
        public async Task<IActionResult> ProcessPayment([FromBody] CreditCardPaymentDto dto)
        {
            try
            {
                _logger.LogInformation($"Credit card payment endpoint called for orderId: {dto.OrderId}");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (dto == null || dto.OrderId <= 0)
                    return BadRequest(new { isSuccess = false, message = "Invalid order ID" });

                var (success, message) = await _creditCardService.ProcessPaymentAsync(
                    dto.OrderId,
                    dto.CardNumber,
                    dto.CardHolderName,
                    dto.ExpiryDate,
                    dto.CVV
                );

                if (success)
                {
                    _logger.LogInformation($"✅ Credit card payment successful for order {dto.OrderId}");
                    return Ok(new { isSuccess = true, message = message });
                }
                else
                {
                    _logger.LogWarning($"❌ Credit card payment failed for order {dto.OrderId}: {message}");
                    return BadRequest(new { isSuccess = false, message = message });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing credit card payment for orderId: {dto?.OrderId}");
                return StatusCode(500, new { isSuccess = false, message = ex.Message });
            }
        }
    }
}
