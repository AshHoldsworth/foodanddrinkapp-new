using System.Net;
using FoodAndDrinkApi.Responses.Constants;

namespace FoodAndDrinkApi.Responses;

internal class MealResponse : BaseApiResponse
{
    internal static MealResponse FailureResult(string? reason = null)
    {
        return new MealResponse
        {
            ErrorMessage = reason,
            StatusCode = reason switch
            {
                MealFailure.BadRequest => HttpStatusCode.BadRequest,
                MealFailure.NotFound => HttpStatusCode.NotFound,
                MealFailure.AlreadyExists => HttpStatusCode.Conflict,
                MealFailure.NoUpdatesDetected => HttpStatusCode.NotModified,
                _ => HttpStatusCode.InternalServerError
            }
        };
    }
}
