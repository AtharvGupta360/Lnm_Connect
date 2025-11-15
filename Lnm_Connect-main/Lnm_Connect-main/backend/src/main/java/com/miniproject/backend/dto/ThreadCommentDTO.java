package com.miniproject.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for ThreadComment responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThreadCommentDTO {
    private String id;
    private String threadId;
    private String authorId;
    private String authorName;
    private String authorProfilePic;
    private String parentCommentId;
    private String content;
    private Integer upvotes;
    private Integer downvotes;
    private Integer voteScore;
    private Integer replyCount;
    private Integer depth;
    private Boolean isDeleted;
    private Boolean isEdited;
    private Integer userVote; // 0 (no vote), 1 (upvoted), or -1 (downvoted) for current user
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
