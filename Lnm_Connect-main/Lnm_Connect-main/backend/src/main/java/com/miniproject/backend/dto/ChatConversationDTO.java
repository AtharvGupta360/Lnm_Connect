package com.miniproject.backend.dto;

import com.miniproject.backend.model.Message;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatConversationDTO {
    private String chatRoomId;
    private String otherUserId;
    private String otherUserName;
    private String otherUserPhotoUrl;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private long unreadCount;
    private Message.MessageStatus lastMessageStatus;
    private boolean isLastMessageFromMe;
}
