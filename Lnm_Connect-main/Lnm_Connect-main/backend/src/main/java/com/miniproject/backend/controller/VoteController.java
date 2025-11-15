package com.miniproject.backend.controller;

import com.miniproject.backend.model.Vote;
import com.miniproject.backend.service.VoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller for Vote operations
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VoteController {
    
    private final VoteService voteService;
    
    /**
     * Vote on a thread
     * POST /api/threads/{threadId}/vote
     * Body: { "userId": "xxx", "value": 1 or -1 }
     */
    @PostMapping("/threads/{threadId}/vote")
    public ResponseEntity<Map<String, Object>> voteOnThread(
            @PathVariable String threadId,
            @RequestBody Map<String, Object> request) {
        
        String userId = (String) request.get("userId");
        Integer value = (Integer) request.get("value");
        
        if (userId == null || userId.trim().isEmpty()) {
            throw new RuntimeException("User ID is required");
        }
        if (value == null || (value != 1 && value != -1)) {
            throw new RuntimeException("Vote value must be 1 (upvote) or -1 (downvote)");
        }
        
        Vote vote = voteService.voteOnThread(userId, threadId, value);
        
        if (vote == null) {
            // Vote was removed (toggled off)
            return ResponseEntity.ok(Map.of(
                "message", "Vote removed",
                "userVote", 0
            ));
        } else {
            return ResponseEntity.ok(Map.of(
                "message", value == 1 ? "Upvoted" : "Downvoted",
                "userVote", vote.getValue()
            ));
        }
    }
    
    /**
     * Vote on a comment
     * POST /api/comments/{commentId}/vote
     * Body: { "userId": "xxx", "value": 1 or -1 }
     */
    @PostMapping("/comments/{commentId}/vote")
    public ResponseEntity<Map<String, Object>> voteOnComment(
            @PathVariable String commentId,
            @RequestBody Map<String, Object> request) {
        
        String userId = (String) request.get("userId");
        Integer value = (Integer) request.get("value");
        
        if (userId == null || userId.trim().isEmpty()) {
            throw new RuntimeException("User ID is required");
        }
        if (value == null || (value != 1 && value != -1)) {
            throw new RuntimeException("Vote value must be 1 (upvote) or -1 (downvote)");
        }
        
        Vote vote = voteService.voteOnComment(userId, commentId, value);
        
        if (vote == null) {
            // Vote was removed (toggled off)
            return ResponseEntity.ok(Map.of(
                "message", "Vote removed",
                "userVote", 0
            ));
        } else {
            return ResponseEntity.ok(Map.of(
                "message", value == 1 ? "Upvoted" : "Downvoted",
                "userVote", vote.getValue()
            ));
        }
    }
    
    /**
     * Get user's vote on a thread
     * GET /api/threads/{threadId}/vote?userId=xxx
     */
    @GetMapping("/threads/{threadId}/vote")
    public ResponseEntity<Map<String, Integer>> getUserVoteOnThread(
            @PathVariable String threadId,
            @RequestParam String userId) {
        
        Integer userVote = voteService.getUserVoteOnThread(userId, threadId);
        return ResponseEntity.ok(Map.of("userVote", userVote));
    }
    
    /**
     * Get user's vote on a comment
     * GET /api/comments/{commentId}/vote?userId=xxx
     */
    @GetMapping("/comments/{commentId}/vote")
    public ResponseEntity<Map<String, Integer>> getUserVoteOnComment(
            @PathVariable String commentId,
            @RequestParam String userId) {
        
        Integer userVote = voteService.getUserVoteOnComment(userId, commentId);
        return ResponseEntity.ok(Map.of("userVote", userVote));
    }
    
    /**
     * Remove a vote
     * DELETE /api/votes?userId=xxx&targetId=xxx&targetType=THREAD|COMMENT
     */
    @DeleteMapping("/votes")
    public ResponseEntity<Map<String, String>> removeVote(
            @RequestParam String userId,
            @RequestParam String targetId,
            @RequestParam String targetType) {
        
        if (!"THREAD".equals(targetType) && !"COMMENT".equals(targetType)) {
            throw new RuntimeException("Target type must be THREAD or COMMENT");
        }
        
        voteService.removeVote(userId, targetId, targetType);
        return ResponseEntity.ok(Map.of("message", "Vote removed successfully"));
    }
}
