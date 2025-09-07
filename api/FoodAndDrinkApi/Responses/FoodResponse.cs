using System.Net;
using FoodAndDrinkApi.Responses.Constants;

namespace FoodAndDrinkApi.Responses;

internal class FoodResponse : BaseApiResponse
{
    internal static FoodResponse FailureResult(string? reason = null)
    {
        return new FoodResponse
        {
            ErrorMessage = reason,
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
