namespace factustock.DTOs
{
    public record PagedResult<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize
)
    {
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNext => Page < TotalPages;
        public bool HasPrev => Page > 1;
    }

    public record Result(bool Success, string? Error = null)
    {
        public static Result Ok() => new(true);
        public static Result Failure(string error) => new(false, error);
    }

    public record Result<T>(bool Success, T? Data = default, string? Error = null)
    {
        public static Result<T> Ok(T data) => new(true, data);
        public static Result<T> Failure(string error) => new(false, default, error);
    }
}
