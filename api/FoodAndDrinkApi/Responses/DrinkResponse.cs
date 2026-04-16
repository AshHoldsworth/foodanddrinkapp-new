using System.Net;
using FoodAndDrinkApi.Responses.Constants;

namespace FoodAndDrinkApi.Responses;

internal class DrinkResponse : BaseApiResponse
{
    internal static DrinkResponse FailureResult(string? reason = null)
    {
        return new DrinkResponse
        {
            ErrorMessage = reason,
            StatusCode = reason switch
            {
                DrinkFailure.BadRequest => HttpStatusCode.BadRequest,
                DrinkFailure.NotFound => HttpStatusCode.NotFound,
                DrinkFailure.AlreadyExists => HttpStatusCode.Conflict,
                DrinkFailure.NoUpdatesDetected => HttpStatusCode.BadRequest,
                _ => HttpStatusCode.InternalServerError
            }
        };
    }
}
