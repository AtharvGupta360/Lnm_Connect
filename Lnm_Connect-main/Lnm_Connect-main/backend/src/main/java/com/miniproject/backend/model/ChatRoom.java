package com.miniproject.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "chat_rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    @Id
    private String id;
    
    private String user1Id;
    private String user2Id;
    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    
    public ChatRoom(String user1Id, String user2Id) {
        this.user1Id = user1Id;
        this.user2Id = user2Id;
        this.createdAt = LocalDateTime.now();
        this.lastMessageAt = LocalDateTime.now();
    }
    
    // Check if a user is part of this chat room
    public boolean containsUser(String userId) {
        return user1Id.equals(userId) || user2Id.equals(userId);
    }
    
    // Get the other user's ID
    public String getOtherUserId(String currentUserId) {
        return user1Id.equals(currentUserId) ? user2Id : user1Id;
    }
}
