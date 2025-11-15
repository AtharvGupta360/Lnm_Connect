package com.miniproject.backend.controller;

import com.miniproject.backend.dto.ThreadCommentDTO;
import com.miniproject.backend.service.ThreadCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for ThreadComment operations
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ThreadCommentController {
    
    private final ThreadCommentService commentService;
    
    /**
     * Add a comment to a thread
     * POST /api/threads/{threadId}/comments
     * Body: { "userId": "xxx", "content": "...", "parentCommentId": "xxx" (optional) }
     */
    @PostMapping("/threads/{threadId}/comments")
    public ResponseEntity<ThreadCommentDTO> addComment(
            @PathVariable String threadId,
            @RequestBody Map<String, Object> request) {
        
        String userId = (String) request.get("userId");
        String content = (String) request.get("content");
        String parentCommentId = (String) request.get("parentCommentId");
        
        if (userId == null || userId.trim().isEmpty()) {
            throw new RuntimeException("User ID is required");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Comment content is required");
        }
        
        ThreadCommentDTO comment = commentService.addComment(userId, threadId, content, parentCommentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }
    
    /**
     * Get all comments for a thread
     * GET /api/threads/{threadId}/comments?userId=xxx
     */
    @GetMapping("/threads/{threadId}/comments")
    public ResponseEntity<List<ThreadCommentDTO>> getComments(
            @PathVariable String threadId,
            @RequestParam String userId) {
        
        List<ThreadCommentDTO> comments = commentService.getCommentsByThread(threadId, userId);
        return ResponseEntity.ok(comments);
    }
    
    /**
     * Update a comment
     * PUT /api/comments/{commentId}
     * Body: { "userId": "xxx", "content": "..." }
     */
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<ThreadCommentDTO> updateComment(
            @PathVariable String commentId,
            @RequestBody Map<String, Object> request) {
        
        String userId = (String) request.get("userId");
        String content = (String) request.get("content");
        
        if (userId == null || userId.trim().isEmpty()) {
            throw new RuntimeException("User ID is required");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Comment content is required");
        }
        
        ThreadCommentDTO comment = commentService.updateComment(commentId, userId, content);
        return ResponseEntity.ok(comment);
    }
    
    /**
     * Delete a comment
     * DELETE /api/comments/{commentId}?userId=xxx
     */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String commentId,
            @RequestParam String userId) {
        
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}
