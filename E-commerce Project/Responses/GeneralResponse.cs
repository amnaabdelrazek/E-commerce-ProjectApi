namespace E_commerce_Project.Responses
{
    public class GeneralResponse<T>
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }

        public static GeneralResponse<T> Success(T data, string message = "")
        {
            return new GeneralResponse<T>
            {
                IsSuccess = true,
                Data = data,
                Message = message
            };
        }

        public static GeneralResponse<T> Fail(string message)
        {
            return new GeneralResponse<T>
            {
                IsSuccess = false,
                Message = message
            };
        }
    }
}