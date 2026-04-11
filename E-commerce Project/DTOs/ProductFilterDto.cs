public class ProductFilterDto
{
    public string? Name { get; set; }
    public int? CategoryId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }

    // 🔥 جديد
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;

    public string? SortBy { get; set; } = "price"; // price / name
    public string? SortDirection { get; set; } = "asc"; // asc / desc
}