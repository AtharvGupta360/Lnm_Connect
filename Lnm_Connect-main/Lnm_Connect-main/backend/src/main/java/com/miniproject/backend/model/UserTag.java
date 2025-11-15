package com.miniproject.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Model for user tags/mentions
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_tags")
public class UserTag {
    @Id
    private String id;
    
    // The user who was tagged
    private String taggedUserId;
    
    // The user who created the tag
    private String taggerUserId;
    
    // The post/content where the tag occurred
    private String contentId;
    private String contentType; // "post", "comment", "thread", etc.
    
    // The actual text content with the tag
    private String content;
    
    // Metadata
    private LocalDateTime createdAt;
    private Boolean isRead; // Whether the tagged user has seen it
}
