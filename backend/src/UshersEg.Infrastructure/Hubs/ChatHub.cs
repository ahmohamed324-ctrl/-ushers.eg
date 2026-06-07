using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace UshersEg.Infrastructure.Hubs;

[Authorize]
public class ChatHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId is not null)
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        await base.OnConnectedAsync();
    }

    public async Task SendMessage(string receiverId, string message)
    {
        var senderId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        await Clients.Group(receiverId).SendAsync("ReceiveMessage", new
        {
            senderId,
            content = message,
            sentAt = DateTime.UtcNow
        });
    }

    public async Task MarkAsRead(string senderId)
    {
        await Clients.Group(senderId).SendAsync("MessagesRead");
    }
}
