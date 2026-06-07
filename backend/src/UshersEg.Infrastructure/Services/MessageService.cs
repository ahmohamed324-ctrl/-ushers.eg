using Microsoft.EntityFrameworkCore;
using UshersEg.Application.DTOs.Jobs;
using UshersEg.Application.DTOs.Messages;
using UshersEg.Application.Interfaces;
using UshersEg.Domain.Entities;
using UshersEg.Infrastructure.Data;

namespace UshersEg.Infrastructure.Services;

public class MessageService : IMessageService
{
    private readonly ApplicationDbContext _db;

    public MessageService(ApplicationDbContext db) => _db = db;

    public async Task<List<ConversationDto>> GetConversationsAsync(Guid userId)
    {
        var messages = await _db.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        var conversations = messages
            .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
            .Select(g =>
            {
                var otherId = g.Key;
                var last = g.First();
                var other = last.SenderId == userId ? last.Receiver : last.Sender;
                var unread = g.Count(m => m.ReceiverId == userId && !m.IsRead);
                return new ConversationDto
                {
                    UserId = otherId,
                    UserName = other.FullName,
                    UserAvatarUrl = other.AvatarUrl,
                    LastMessage = last.Content.Length > 60 ? last.Content[..60] + "..." : last.Content,
                    LastMessageAt = last.CreatedAt,
                    UnreadCount = unread
                };
            })
            .OrderByDescending(c => c.LastMessageAt)
            .ToList();

        return conversations;
    }

    public async Task<PagedResult<MessageDto>> GetMessagesAsync(Guid userId, Guid otherUserId, int page, int pageSize)
    {
        var q = _db.Messages
            .Include(m => m.Sender)
            .Where(m => (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                        (m.SenderId == otherUserId && m.ReceiverId == userId))
            .OrderByDescending(m => m.CreatedAt);

        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PagedResult<MessageDto>
        {
            Items = items.Select(m => new MessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderName = m.Sender.FullName,
                SenderAvatarUrl = m.Sender.AvatarUrl,
                ReceiverId = m.ReceiverId,
                Content = m.Content,
                IsRead = m.IsRead,
                CreatedAt = m.CreatedAt
            }).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<MessageDto> SendMessageAsync(Guid senderId, SendMessageDto dto)
    {
        var receiver = await _db.Users.FindAsync(dto.ReceiverId)
            ?? throw new KeyNotFoundException("Receiver not found.");

        var sender = await _db.Users.FindAsync(senderId)!;

        var message = new Message
        {
            SenderId = senderId,
            ReceiverId = dto.ReceiverId,
            Content = dto.Content
        };

        _db.Messages.Add(message);

        // Notification
        _db.Notifications.Add(new Notification
        {
            UserId = dto.ReceiverId,
            Title = $"New message from {sender!.FirstName}",
            Message = dto.Content.Length > 60 ? dto.Content[..60] + "..." : dto.Content,
            Type = "message"
        });

        await _db.SaveChangesAsync();

        return new MessageDto
        {
            Id = message.Id,
            SenderId = senderId,
            SenderName = sender!.FullName,
            SenderAvatarUrl = sender.AvatarUrl,
            ReceiverId = dto.ReceiverId,
            Content = message.Content,
            IsRead = false,
            CreatedAt = message.CreatedAt
        };
    }

    public async Task MarkAsReadAsync(Guid receiverId, Guid senderId)
    {
        await _db.Messages
            .Where(m => m.SenderId == senderId && m.ReceiverId == receiverId && !m.IsRead)
            .ExecuteUpdateAsync(s => s
                .SetProperty(m => m.IsRead, true)
                .SetProperty(m => m.ReadAt, DateTime.UtcNow));
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
        => await _db.Messages.CountAsync(m => m.ReceiverId == userId && !m.IsRead);
}
