using UshersEg.Application.DTOs.Messages;
using UshersEg.Application.DTOs.Jobs;

namespace UshersEg.Application.Interfaces;

public interface IMessageService
{
    Task<List<ConversationDto>> GetConversationsAsync(Guid userId);
    Task<PagedResult<MessageDto>> GetMessagesAsync(Guid userId, Guid otherUserId, int page, int pageSize);
    Task<MessageDto> SendMessageAsync(Guid senderId, SendMessageDto dto);
    Task MarkAsReadAsync(Guid receiverId, Guid senderId);
    Task<int> GetUnreadCountAsync(Guid userId);
}
