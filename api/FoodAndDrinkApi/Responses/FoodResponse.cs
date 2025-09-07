using System.Net;
using FoodAndDrinkApi.Responses.Constants;

namespace FoodAndDrinkApi.Responses;

internal class FoodResponse : BaseApiResponse
{
    private string? FailureReason { get; init; }

    internal static FoodResponse FailureResult(string? reason = null)
    {
        return new FoodResponse
        {
            FailureReason = reason,
            StatusCode = reason switch
            {
                FoodFailure.BadRequest => HttpStatusCode.BadRequest,
                FoodFailure.NotFound => HttpStatusCode.NotFound,
                FoodFailure.AlreadyExists => HttpStatusCode.Conflict,
                _ => HttpStatusCode.InternalServerError
            }
        };
    }
}