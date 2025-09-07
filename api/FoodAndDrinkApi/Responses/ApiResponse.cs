using System.Net;

namespace FoodAndDrinkApi.Responses;

internal class ApiResponse<T> : BaseApiResponse
{
    private T? Data { get; init; }

    internal static ApiResponse<T> SuccessResult(T data)
    {
        return new ApiResponse<T>
        {
            StatusCode = HttpStatusCode.OK,
            Data = data
        };
    }

    internal static ApiResponse<T> FailureResult(HttpStatusCode statusCode, string errorMessage)
    {
        return new ApiResponse<T>
        {
            StatusCode = statusCode,
            ErrorMessage = errorMessage
        };
    }
}