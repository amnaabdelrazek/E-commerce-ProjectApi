using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayPal;

namespace E_commerce_Project.Controllers.Payment
{
    [Route("api/[controller]")]
    [ApiController]
    public class PayPalController : ControllerBase
    {
        private readonly IPayPalService _paypal;
        private readonly ILogger<PayPalController> _logger;

        public PayPalController(IPayPalService paypal, ILogger<PayPalController> logger)
        {
            _paypal = paypal;
            _logger = logger;
        }

        // ================= CREATE =================
        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> Create(int orderId)
        {
            try
            {
                _logger.LogInformation($"PayPal Create endpoint called for orderId: {orderId}");
                
                var url = await _paypal.CreatePaymentAsync(orderId);
                
                _logger.LogInformation($"PayPal URL generated: {url}");
                return Ok(new { url });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating PayPal payment for orderId: {orderId}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ================= EXECUTE =================
        [HttpGet("execute")]
        public async Task<IActionResult> Execute(string paymentId, string payerId)
        {
            try
            {
                // Validate inputs
                if (string.IsNullOrWhiteSpace(paymentId) || string.IsNullOrWhiteSpace(payerId))
                {
                    _logger.LogWarning($"Missing PayPal parameters: paymentId={paymentId}, payerId={payerId}");
                    return BadRequest(new { message = "Missing payment ID or payer ID" });
                }

                _logger.LogInformation($"Executing PayPal payment: paymentId={paymentId}, payerId={payerId}");
                
                var success = await _paypal.ExecutePaymentAsync(paymentId, payerId);

                if (success)
                {
                    _logger.LogInformation($"✅ PayPal payment executed successfully: {paymentId}");
                    return Ok(new { message = "Payment successful", paymentId = paymentId });
                }

                _logger.LogWarning($"❌ PayPal payment execution failed (not approved): {paymentId}");
                return BadRequest(new { message = "Payment failed - not approved" });
            }
            catch (HttpException hex)
            {
                _logger.LogError($"❌ PayPal HTTP Error: {hex.Message}");
                
                string errorMsg = "PayPal payment execution failed";
                if (hex.Message.Contains("404"))
                    errorMsg = "Payment not found. It may have expired or been cancelled.";
                else if (hex.Message.Contains("400"))
                    errorMsg = "Invalid payment or payer ID. Payment may have expired.";
                
                return StatusCode(502, new { message = errorMsg });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error executing PayPal payment: paymentId={paymentId}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ================= CANCEL =================
        [HttpGet("cancel")]
        public async Task<IActionResult> Cancel(string paymentId)
        {
            await _paypal.CancelPaymentAsync(paymentId);
            return Ok(new { message = "Payment cancelled" });
        }
    }
}