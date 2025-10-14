package com.miniproject.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO for ThreadComment responses (with nested replies)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private String id;
    private String threadId;
    private String authorId;
    private String authorName;
    private String authorPhotoUrl;
    private String parentCommentId;
    private String content;
    private Integer upvotes;
    private Integer downvotes;
    private Integer voteScore;
    private Integer replyCount;
    private Integer depth;
    private Boolean isDeleted;
    private Boolean isEdited;
    private Integer userVote; // null, 1 (upvoted), or -1 (downvoted) for current user
    private Boolean isAuthor; // true if current user is the author
    private List<CommentDTO> replies = new ArrayList<>(); // Nested replies
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
