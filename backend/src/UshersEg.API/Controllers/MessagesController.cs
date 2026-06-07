using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UshersEg.Application.Common;
using UshersEg.Application.DTOs.Jobs;
using UshersEg.Application.DTOs.Messages;
using UshersEg.Application.Interfaces;

namespace UshersEg.API.Controllers;

[ApiController]
[Route("api/v1/messages")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messages;

    public MessagesController(IMessageService messages) => _messages = messages;

    private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet("conversations")]
    public async Task<ActionResult<ApiResponse<List<ConversationDto>>>> GetConversations()
    {
        var result = await _messages.GetConversationsAsync(UserId);
        return Ok(ApiResponse<List<ConversationDto>>.Ok(result));
    }

    [HttpGet("{otherUserId:guid}")]
    public async Task<ActionResult<ApiResponse<PagedResult<MessageDto>>>> GetMessages(Guid otherUserId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        await _messages.MarkAsReadAsync(UserId, otherUserId);
        var result = await _messages.GetMessagesAsync(UserId, otherUserId, page, pageSize);
        return Ok(ApiResponse<PagedResult<MessageDto>>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<MessageDto>>> Send(SendMessageDto dto)
    {
        try
        {
            var result = await _messages.SendMessageAsync(UserId, dto);
            return Ok(ApiResponse<MessageDto>.Ok(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<MessageDto>.Fail(ex.Message));
        }
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<ApiResponse<int>>> UnreadCount()
    {
        var count = await _messages.GetUnreadCountAsync(UserId);
        return Ok(ApiResponse<int>.Ok(count));
    }
}
