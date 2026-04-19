using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace E_commerce_Project.Controllers.Payment
{
    [Route("api/[controller]")]
    [ApiController]
    public class PayPalController : ControllerBase
    {
        private readonly IPayPalService _paypal;

        public PayPalController(IPayPalService paypal)
        {
            _paypal = paypal;
        }

        // ================= CREATE =================
        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> Create(int orderId)
        {
            var url = await _paypal.CreatePaymentAsync(orderId);

            return Ok(new { url });
        }

        // ================= EXECUTE =================
        [HttpGet("execute")]
        public async Task<IActionResult> Execute(string paymentId, string payerId)
        {
            var success = await _paypal.ExecutePaymentAsync(paymentId, payerId);

            if (success)
                return Ok(new { message = "Payment successful" });

            return BadRequest(new { message = "Payment failed" });
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