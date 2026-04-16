using E_commerce_Project.DTOs;
using E_commerce_Project.Models;
using E_commerce_Project.Responses;
using E_commerce_Project.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace E_commerce_Project.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWebHostEnvironment _env;

        public UserService(UserManager<ApplicationUser> userManager, IWebHostEnvironment env)
        {
            _userManager = userManager;
            _env = env;
        }

        public async Task<GeneralResponse<object>> GetProfileAsync(ClaimsPrincipal userPrincipal)
        {
            var userId = _userManager.GetUserId(userPrincipal);
            var user = await _userManager.Users
                .Include(u => u.Orders)
                .Include(u => u.Wishlists)
                .Include(u => u.Reviews)
                .FirstOrDefaultAsync(u => u.Id == userId);


            if (user == null)
                return GeneralResponse<object>.Fail("User not found");

            return GeneralResponse<object>.Success(new
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.Email,
                city = user.City,
                street = user.Street,
                profileImageUrl = user.ProfileImageUrl,
                ordersCount = user.Orders.Count,
                wishlistCount = user.Wishlists.Count,
                reviewsCount = user.Reviews.Count
            });
        }

        public async Task<GeneralResponse<string>> UpdateProfileAsync(ClaimsPrincipal userPrincipal, UpdateProfileDto dto)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);

            if (user == null)
                return GeneralResponse<string>.Fail("User not found");

            user.FullName = dto.FullName ?? user.FullName;
            user.City = dto.City ?? user.City;
            user.Street = dto.Street ?? user.Street;

            // Handle image upload
            if (dto.ProfileImage != null && dto.ProfileImage.Length > 0)
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                var ext = Path.GetExtension(dto.ProfileImage.FileName).ToLower();

                if (!allowedExtensions.Contains(ext))
                    return GeneralResponse<string>.Fail("Invalid file type");

                var folder = Path.Combine(_env.WebRootPath, "images");
                if (!Directory.Exists(folder))
                    Directory.CreateDirectory(folder);

                var fileName = Guid.NewGuid() + ext;
                var path = Path.Combine(folder, fileName);

                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await dto.ProfileImage.CopyToAsync(stream);
                }

                user.ProfileImageUrl = "/images/" + fileName;
            }

            await _userManager.UpdateAsync(user);

            return GeneralResponse<string>.Success("Profile updated");
        }

        public async Task<GeneralResponse<string>> UploadImageAsync(ClaimsPrincipal userPrincipal, IFormFile file)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);

            if (user == null)
                return GeneralResponse<string>.Fail("User not found");

            if (file == null || file.Length == 0)
                return GeneralResponse<string>.Fail("Invalid file");

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var ext = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(ext))
                return GeneralResponse<string>.Fail("Invalid file type");

            var folder = Path.Combine(_env.WebRootPath, "images");

            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var fileName = Guid.NewGuid() + ext;
            var path = Path.Combine(folder, fileName);

            using (var stream = new FileStream(path, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            user.ProfileImageUrl = "/images/" + fileName;
            await _userManager.UpdateAsync(user);

            return GeneralResponse<string>.Success(user.ProfileImageUrl);
        }

        public async Task<GeneralResponse<string>> ChangePasswordAsync(ClaimsPrincipal userPrincipal, ChangePasswordDto dto)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);

            if (user == null)
                return GeneralResponse<string>.Fail("User not found");

            var result = await _userManager.ChangePasswordAsync(
                user,
                dto.CurrentPassword,
                dto.NewPassword
            );

            if (!result.Succeeded)
                return GeneralResponse<string>.Fail("Password change failed");

            return GeneralResponse<string>.Success("Password changed");
        }
    }
}