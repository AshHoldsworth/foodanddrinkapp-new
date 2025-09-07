using System.Net;
using System.Text.Json;

namespace FoodAndDrinkApi.Responses;

internal class ApiResponse<T> : BaseApiResponse
{
    public T? Data { get; set; }

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
