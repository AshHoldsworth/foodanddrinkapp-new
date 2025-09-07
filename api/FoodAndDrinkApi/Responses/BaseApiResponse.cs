using System.Net;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace FoodAndDrinkApi.Responses;

public class BaseApiResponse : IActionResult
{
    public string? ErrorMessage { get; init; }
    
    protected HttpStatusCode StatusCode { get; init; }

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
