using System.Net;
using FoodAndDrinkApi.Responses.Constants;

namespace FoodAndDrinkApi.Responses;

internal class IngredientResponse : BaseApiResponse
{ 
    internal static IngredientResponse FailureResult(string? reason = null)
    {
        return new IngredientResponse
        {
            ErrorMessage = reason,
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
