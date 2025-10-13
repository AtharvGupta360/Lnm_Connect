package com.miniproject.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    @Id
    private String id;
    
    private String chatRoomId;
    private String senderId;
    private String receiverId;
    private String content;
    private String attachmentUrl;
    private LocalDateTime timestamp;
    private MessageStatus status;
    
    public Message(String chatRoomId, String senderId, String receiverId, String content) {
        this.chatRoomId = chatRoomId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.timestamp = LocalDateTime.now();
        this.status = MessageStatus.SENT;
    }
    
    public enum MessageStatus {
        SENT,
        DELIVERED,
        READ
    }
}
