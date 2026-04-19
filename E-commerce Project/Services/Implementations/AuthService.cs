
using E_commerce_Project.Data;
using E_commerce_Project.DTOs;
using E_commerce_Project.Helpers;
using E_commerce_Project.Models;
using E_commerce_Project.Responses;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace E_commerce_Project.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtHelper _jwt;
        private readonly AppDbContext _dbContext;

        public AuthService(UserManager<ApplicationUser> userManager, JwtHelper jwt, AppDbContext dbContext)
        {
            _userManager = userManager;
            _jwt = jwt;
            _dbContext = dbContext;
        }

        public async Task<GeneralResponse<object>> RegisterAsync(RegisterDto dto)
        {
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FullName = dto.FullName
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return GeneralResponse<object>.Fail($"Registration failed: {errors}");
            }

            var allowedRoles = new[] { "Customer", "Seller" };

            if (!allowedRoles.Contains(dto.Role))
                return GeneralResponse<object>.Fail("Invalid role");

            // Assign Role
            await _userManager.AddToRoleAsync(user, dto.Role);

            // Email Confirmation Token
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

            return GeneralResponse<object>.Success(new
            {
                UserId = user.Id,
                Token = token
            }, "User Created (confirm email required)");
        }

        public async Task<GeneralResponse<object>> LoginAsync(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);

            if (user == null)
                return GeneralResponse<object>.Fail("Invalid Email");

            // Admin soft-delete should prevent login (do not issue JWT).
            if (user.IsDeleted)
                return GeneralResponse<object>.Fail("User is deleted");

            // Respect Identity lockout to prevent login for restricted users.
            if (user.LockoutEnabled && user.LockoutEnd != null && user.LockoutEnd > DateTimeOffset.UtcNow)
                return GeneralResponse<object>.Fail("User is locked");

            //if (!user.EmailConfirmed)
            //    return GeneralResponse<object>.Fail("Email not confirmed");

            var valid = await _userManager.CheckPasswordAsync(user, dto.Password);

            if (!valid)
                return GeneralResponse<object>.Fail("Invalid Password");

            var roles = await _userManager.GetRolesAsync(user);

            var sellerRecord = await _dbContext.Sellers
    .AsNoTracking()
    .FirstOrDefaultAsync(s => s.UserId == user.Id);

            // If user is a seller (has seller record), enforce approval
            if (sellerRecord != null)
            {
                if (!sellerRecord.IsApproved)
                    return GeneralResponse<object>.Fail("Seller account is pending admin approval");
            }

            var token = _jwt.GenerateToken(user, roles);

            // Build the response object as required
            var response = new
            {
                token,
                user = new
                {
                    id = user.Id,
                    name = user.FullName,
                    email = user.Email,
                    role = roles.FirstOrDefault() // or string.Join(",", roles) if multiple roles
                }
            };

            return GeneralResponse<object>.Success(response, "Login Success");
        }

        public async Task<GeneralResponse<string>> ConfirmEmailAsync(string userId, string token)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return GeneralResponse<string>.Fail("User not found");

            var result = await _userManager.ConfirmEmailAsync(user, token);

            if (!result.Succeeded)
                return GeneralResponse<string>.Fail("Invalid token");

            return GeneralResponse<string>.Success("Email confirmed");
        }
        //new
        public async Task<GeneralResponse<object>> RegisterSellerAsync(RegisterSellerDto dto)
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();

            try
            {
                var user = new ApplicationUser
                {
                    UserName = dto.Email,
                    Email = dto.Email,
                    FullName = dto.FullName
                };

                var result = await _userManager.CreateAsync(user, dto.Password);

                if (!result.Succeeded)
                {
                    var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                    return GeneralResponse<object>.Fail(errors);
                }

                // ❌ DO NOT assign Seller role here

                var seller = new Seller
                {
                    UserId = user.Id,
                    StoreName = dto.StoreName,
                    StoreDescription = dto.StoreDescription ?? "No description provided",
                    BusinessAddress = dto.BusinessAddress ?? "No address provided",
                    Balance = 0,
                    IsApproved = false // IMPORTANT
                };

                await _dbContext.Sellers.AddAsync(seller);
                await _dbContext.SaveChangesAsync();

                await transaction.CommitAsync();

                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

                return GeneralResponse<object>.Success(new
                {
                    userId = user.Id,
                    email = user.Email,
                    approvalStatus = "Pending",
                    message = "Account created. Awaiting admin approval."
                }, "Seller registration successful");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return GeneralResponse<object>.Fail(ex.Message);
            }
        }
    }
  
}