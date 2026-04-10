
    using E_commerce_Project.Models;
    using E_commerce_Project.Repositories.Interfaces;
    using global::E_commerce_Project.Models;
    using global::E_commerce_Project.Repositories.Interfaces;
    using Microsoft.AspNetCore.Identity;

    namespace E_commerce_Project.Repositories.Implementations
    {
        public class UserRepository : IUserRepository
        {
            private readonly UserManager<ApplicationUser> _userManager;

            public UserRepository(UserManager<ApplicationUser> userManager)
            {
                _userManager = userManager;
            }

            // ================= GET BY ID =================
            public async Task<ApplicationUser?> GetByIdAsync(string id)
            {
                return await _userManager.FindByIdAsync(id);
            }

            // ================= GET BY EMAIL =================
            public async Task<ApplicationUser?> GetByEmailAsync(string email)
            {
                return await _userManager.FindByEmailAsync(email);
            }

            // ================= UPDATE =================
            public async Task UpdateAsync(ApplicationUser user)
            {
                await _userManager.UpdateAsync(user);
            }
        }
    }

