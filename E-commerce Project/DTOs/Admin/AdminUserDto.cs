namespace E_commerce_Project.DTOs
{
    public class AdminUserDto
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string Role { get; set; }
        public bool IsLocked { get; set; }
        public bool IsDeleted { get; set; }
    }
}
