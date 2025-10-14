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
 * ThreadComment Model
 * Represents a comment on a discussion thread (supports nested/threaded comments)
 */
@Document(collection = "thread_comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndexes({
    @CompoundIndex(name = "thread_created_idx", def = "{'threadId': 1, 'createdAt': 1}"),
    @CompoundIndex(name = "parent_created_idx", def = "{'threadId': 1, 'parentCommentId': 1, 'createdAt': 1}")
})
public class ThreadComment {
    
    @Id
    private String id;
    
    private String threadId; // Reference to Thread
    
    private String authorId; // User who created this comment
    
    private String parentCommentId; // null for top-level comments, otherwise parent comment ID
    
    private String content; // Comment body (supports Markdown)
    
    private Integer upvotes = 0;
    
    private Integer downvotes = 0;
    
    private Integer voteScore = 0; // upvotes - downvotes
    
    private Integer replyCount = 0; // Number of direct replies
    
    private Integer depth = 0; // Nesting level (0 = top-level)
    
    private Boolean isDeleted = false; // Soft delete
    
    private Boolean isEdited = false; // True if comment was edited
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
