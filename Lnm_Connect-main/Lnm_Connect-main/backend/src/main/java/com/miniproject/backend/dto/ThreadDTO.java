package com.miniproject.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for Thread responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThreadDTO {
    private String id;
    private String spaceId;
    private String spaceName;
    private String authorId;
    private String authorName;
    private String authorPhotoUrl;
    private String title;
    private String content;
    private List<String> tags;
    private Integer upvotes;
    private Integer downvotes;
    private Integer voteScore;
    private Integer commentCount;
    private Integer viewCount;
    private Boolean isPinned;
    private Boolean isLocked;
    private Boolean isDeleted;
    private Integer userVote; // null, 1 (upvoted), or -1 (downvoted) for current user
    private Boolean isAuthor; // true if current user is the author
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastActivityAt;
}
