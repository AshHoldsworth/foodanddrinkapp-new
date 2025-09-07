using System.Net;
using Microsoft.AspNetCore.Mvc;

namespace FoodAndDrinkApi.Responses;

internal class BaseApiResponse : IActionResult
{
    protected HttpStatusCode StatusCode { get; init; }
    protected string? ErrorMessage { get; init; }

    internal static BaseApiResponse SuccessResult()
    {
        return new BaseApiResponse
        {
            StatusCode = HttpStatusCode.OK
        };
    }
    
    public async Task ExecuteResultAsync(ActionContext context)
    {
        var objectResult = new ObjectResult(this)
        {
            StatusCode = (int)StatusCode
        };

        await objectResult.ExecuteResultAsync(context);
    }
}