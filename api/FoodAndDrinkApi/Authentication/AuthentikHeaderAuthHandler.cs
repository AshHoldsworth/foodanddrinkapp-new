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
        Logger.LogInformation("[AuthentikHeaderAuthHandler] Authenticating request {Method} {Path}", Request.Method, Request.Path);
        Logger.LogInformation("[AuthentikHeaderAuthHandler] Incoming headers: {Headers}",
            string.Join(" | ", Request.Headers.Select(h => $"{h.Key}={h.Value}")));

        var rawUsername = Request.Headers[AuthentikUsernameHeader].FirstOrDefault();

        Logger.LogInformation("[AuthentikHeaderAuthHandler] Header {HeaderName} value: {HeaderValue}",
            AuthentikUsernameHeader, rawUsername ?? "<null>");

        if (string.IsNullOrWhiteSpace(rawUsername))
        {
            Logger.LogWarning("[AuthentikHeaderAuthHandler] Missing Authentik username header on {Method} {Path}",
                Request.Method, Request.Path);
            return AuthenticateResult.Fail("Missing Authentik username header.");
        }

        var userRepository = Context.RequestServices.GetRequiredService<IUserRepository>();
        var normalizedUsername = rawUsername.Trim().ToLowerInvariant();
        Logger.LogInformation("[AuthentikHeaderAuthHandler] Normalized username: {Username}", normalizedUsername);

        var user = await userRepository.GetByUsername(normalizedUsername);

        Logger.LogInformation("[AuthentikHeaderAuthHandler] User lookup result for {Username}: {Found}",
            normalizedUsername, user != null);

        if (user == null)
        {
            Logger.LogWarning("[AuthentikHeaderAuthHandler] Auto-provisioning user {Username}", normalizedUsername);
            user = await AutoProvisionUser(userRepository, normalizedUsername);
        }

        Logger.LogInformation("[AuthentikHeaderAuthHandler] Authenticated user resolved Id={Id} Username={Username} Role={Role} GroupId={GroupId}",
            user.Id, user.Username, user.Role, user.GroupId ?? "<null>");

        var claims = BuildClaims(user);
        Logger.LogInformation("[AuthentikHeaderAuthHandler] Issuing claims: {Claims}",
            string.Join(" | ", claims.Select(c => $"{c.Type}={c.Value}")));

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
