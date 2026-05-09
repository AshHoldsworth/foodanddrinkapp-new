using System.Security.Claims;
using System.Text.Encodings.Web;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkRepository.Repositories;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace FoodAndDrinkApi.Authentication;

public class AuthentikHeaderAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private const string AuthentikUsernameHeader = "X-authentik-username";

    public AuthentikHeaderAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder) : base(options, logger, encoder)
    {
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var rawUsername = Request.Headers[AuthentikUsernameHeader].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(rawUsername))
        {
            return AuthenticateResult.Fail("Missing Authentik username header.");
        }
        
        Console.WriteLine($"rawUsername: {rawUsername}");

        var userRepository = Context.RequestServices.GetRequiredService<IUserRepository>();
        var normalizedUsername = rawUsername.Trim().ToLowerInvariant();
        var user = await userRepository.GetByUsername(normalizedUsername);

        if (user == null)
        {
            user = await AutoProvisionUser(userRepository, normalizedUsername);
        }

        var claims = BuildClaims(user);
        var identity = new ClaimsIdentity(claims, Scheme.Name, "name", "role");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return AuthenticateResult.Success(ticket);
    }

    private static async Task<User> AutoProvisionUser(IUserRepository userRepository, string username)
    {
        var user = new User(
            id: Guid.NewGuid().ToString(),
            username: username,
            role: "user",
            createdAt: DateTime.UtcNow,
            createdBy: "authentik");

        await userRepository.AddUser(user);
        return user;
    }

    private static List<Claim> BuildClaims(User user)
    {
        var claims = new List<Claim>
        {
            new("sub", user.Id),
            new("name", user.Username),
            new("role", user.Role),
        };

        if (!string.IsNullOrWhiteSpace(user.GroupId))
        {
            claims.Add(new Claim("groupId", user.GroupId));
        }

        return claims;
    }
}
