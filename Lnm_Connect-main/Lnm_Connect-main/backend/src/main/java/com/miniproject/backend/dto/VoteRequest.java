package com.miniproject.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for vote requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoteRequest {
    private String userId;
    private String targetId; // Thread ID or Comment ID
    private String targetType; // "THREAD" or "COMMENT"
    private Integer value; // 1 for upvote, -1 for downvote, 0 to remove vote
}
