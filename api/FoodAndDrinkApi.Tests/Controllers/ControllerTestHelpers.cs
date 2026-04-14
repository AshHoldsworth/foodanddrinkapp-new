using System.Net;
using System.Reflection;
using FoodAndDrinkApi.Responses;

namespace FoodAndDrinkApi.Tests.Controllers;

internal static class ControllerTestHelpers
{
    internal static HttpStatusCode GetStatusCode(BaseApiResponse response)
    {
        var statusCodeProperty = typeof(BaseApiResponse).GetProperty(
            "StatusCode",
            BindingFlags.Instance | BindingFlags.NonPublic);

        if (statusCodeProperty == null)
            throw new InvalidOperationException("StatusCode property could not be found.");

        return (HttpStatusCode)(statusCodeProperty.GetValue(response)
            ?? throw new InvalidOperationException("StatusCode value was null."));
    }
}
