package com.miniproject.backend.dto;

import com.miniproject.backend.model.Message;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private String id;
    private String chatRoomId;
    private String senderId;
    private String senderName;
    private String senderPhotoUrl;
    private String receiverId;
    private String receiverName;
    private String receiverPhotoUrl;
    private String content;
    private String attachmentUrl;
    private LocalDateTime timestamp;
    private Message.MessageStatus status;
}
