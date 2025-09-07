using System.Net;
using FoodAndDrinkApi.Responses.Constants;

namespace FoodAndDrinkApi.Responses;

internal class IngredientResponse : BaseApiResponse
{ 
    private string? FailureReason { get; init; }

    internal static IngredientResponse FailureResult(string? reason = null)
    {
        return new IngredientResponse
        {
            FailureReason = reason,
            StatusCode = reason switch
            {
                IngredientFailure.BadRequest => HttpStatusCode.BadRequest,
                IngredientFailure.NotFound => HttpStatusCode.NotFound,
                IngredientFailure.AlreadyExists => HttpStatusCode.Conflict,
                _ => HttpStatusCode.InternalServerError
            }
        };
    }
}