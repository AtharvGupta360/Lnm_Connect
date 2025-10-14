package com.miniproject.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Thread (Discussion Post) Model
 * Represents a discussion thread within a Space
 */
@Document(collection = "threads")
@Data
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndexes({
    @CompoundIndex(name = "space_created_idx", def = "{'spaceId': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "space_votes_idx", def = "{'spaceId': 1, 'voteScore': -1}")
})
public class Thread {
    
    @Id
    private String id;
    
    private String spaceId; // Reference to Space
    
    private String authorId; // User who created this thread
    
    private String title;
    
    private String content; // Thread body (supports Markdown)
    
    private List<String> tags = new ArrayList<>(); // e.g., ["spring", "database"]
    
    private Integer upvotes = 0;
    
    private Integer downvotes = 0;
    
    private Integer voteScore = 0; // upvotes - downvotes (for sorting)
    
    private Integer commentCount = 0; // Total number of comments
    
    private Integer viewCount = 0; // Number of views
    
    private Boolean isPinned = false; // Pinned by moderator
    
    private Boolean isLocked = false; // If locked, no new comments allowed
    
    private Boolean isDeleted = false; // Soft delete
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private LocalDateTime lastActivityAt; // Last comment or vote time
}
