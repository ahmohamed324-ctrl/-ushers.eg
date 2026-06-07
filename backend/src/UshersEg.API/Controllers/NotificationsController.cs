using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UshersEg.Application.Common;
using UshersEg.Application.DTOs.Notifications;
using UshersEg.Application.Interfaces;

namespace UshersEg.API.Controllers;

[ApiController]
[Route("api/v1/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notifications;

    public NotificationsController(INotificationService notifications)
    {
        _notifications = notifications;
    }

    private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<List<NotificationDto>>>> GetMyNotifications()
    {
        var result = await _notifications.GetMyNotificationsAsync(UserId);
        return Ok(ApiResponse<List<NotificationDto>>.Ok(result));
    }

    [HttpPut("{id}/read")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkAsRead(Guid id)
    {
        await _notifications.MarkAsReadAsync(UserId, id);
        return Ok(ApiResponse<bool>.Ok(true, "Marked as read."));
    }

    [HttpPut("read-all")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkAllAsRead()
    {
        await _notifications.MarkAllAsReadAsync(UserId);
        return Ok(ApiResponse<bool>.Ok(true, "All marked as read."));
    }
}
