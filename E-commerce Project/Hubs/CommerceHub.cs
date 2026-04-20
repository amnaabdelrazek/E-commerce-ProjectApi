using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace E_commerce_Project.Hubs
{
    public class CommerceHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrWhiteSpace(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, CommerceHubGroups.User(userId));
            }

            var roles = Context.User?.FindAll(ClaimTypes.Role).Select(claim => claim.Value) ?? Enumerable.Empty<string>();
            foreach (var role in roles.Where(role => !string.IsNullOrWhiteSpace(role)).Distinct(StringComparer.OrdinalIgnoreCase))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, CommerceHubGroups.Role(role));
            }

            await base.OnConnectedAsync();
        }

        public Task JoinProductGroup(int productId)
        {
            if (productId <= 0)
            {
                return Task.CompletedTask;
            }

            return Groups.AddToGroupAsync(Context.ConnectionId, CommerceHubGroups.Product(productId));
        }

        public Task LeaveProductGroup(int productId)
        {
            if (productId <= 0)
            {
                return Task.CompletedTask;
            }

            return Groups.RemoveFromGroupAsync(Context.ConnectionId, CommerceHubGroups.Product(productId));
        }
    }
}
