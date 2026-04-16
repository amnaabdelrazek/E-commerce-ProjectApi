using System;

namespace E_commerce_Project.DTOs
{
    public class ContentDto
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string TargetUrl { get; set; }
        public int? CategoryId { get; set; }
        public int? ProductId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateContentDto
    {
        public string Type { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;
        public DateTime? EndDate { get; set; }
        public string TargetUrl { get; set; }
        public int? CategoryId { get; set; }
        public int? ProductId { get; set; }
    }

    public class UpdateContentDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime? EndDate { get; set; }
        public string TargetUrl { get; set; }
        public int? CategoryId { get; set; }
        public int? ProductId { get; set; }
    }
}
