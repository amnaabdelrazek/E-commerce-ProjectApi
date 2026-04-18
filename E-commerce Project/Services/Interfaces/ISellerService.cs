using E_commerce_Project.DTOs;
using System.Threading.Tasks;

namespace E_commerce_Project.Services.Interfaces
{
    public interface ISellerService
    {
        Task<SellerProfileDto> GetSellerProfileAsync(string userId);
        Task<bool> UpdateSellerProfileAsync(string userId, UpdateSellerProfileDto dto);
    }
}
