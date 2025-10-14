package com.miniproject.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Vote Model
 * Tracks user votes on threads and comments
 */
@Document(collection = "votes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndexes({
    @CompoundIndex(name = "user_target_type_idx", def = "{'userId': 1, 'targetId': 1, 'targetType': 1}", unique = true),
    @CompoundIndex(name = "target_type_idx", def = "{'targetId': 1, 'targetType': 1}")
})
public class Vote {
    
    @Id
    private String id;
    
    private String userId; // User who voted
    
    private String targetId; // Thread ID or Comment ID
    
    private String targetType; // "THREAD" or "COMMENT"
    
    private Integer value; // 1 for upvote, -1 for downvote
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
