
    using E_commerce_Project.Models;
    using global::E_commerce_Project.Models;

    namespace E_commerce_Project.Repositories.Interfaces
    {
        public interface IUserRepository
        {
            Task<ApplicationUser?> GetByIdAsync(string id);

            Task<ApplicationUser?> GetByEmailAsync(string email);

            Task UpdateAsync(ApplicationUser user);
        }
    }

