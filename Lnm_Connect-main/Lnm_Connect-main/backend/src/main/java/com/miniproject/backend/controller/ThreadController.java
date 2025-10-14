package com.miniproject.backend.controller;

import com.miniproject.backend.dto.ThreadDTO;
import com.miniproject.backend.service.ThreadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Thread operations
 */
@RestController
@RequestMapping("/api/threads")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ThreadController {
    
    private final ThreadService threadService;
    
    /**
     * Create a new thread
     * POST /api/threads
     */
    @PostMapping
    public ResponseEntity<ThreadDTO> createThread(@RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        String spaceId = (String) request.get("spaceId");
        String title = (String) request.get("title");
        String content = (String) request.get("content");
        List<String> tags = (List<String>) request.get("tags");
        
        // Validate required fields
        if (userId == null || userId.trim().isEmpty()) {
            throw new RuntimeException("User ID is required");
        }
        if (spaceId == null || spaceId.trim().isEmpty()) {
            throw new RuntimeException("Space ID is required");
        }
        if (title == null || title.trim().isEmpty()) {
            throw new RuntimeException("Thread title is required");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Thread content is required");
        }
        
        ThreadDTO thread = threadService.createThread(userId, spaceId, title, content, tags);
        return ResponseEntity.status(HttpStatus.CREATED).body(thread);
    }
    
    /**
     * Get all threads for a space
     * GET /api/threads/space/{spaceId}?userId=xxx
     */
    @GetMapping("/space/{spaceId}")
    public ResponseEntity<List<ThreadDTO>> getThreadsBySpace(
            @PathVariable String spaceId,
            @RequestParam String userId) {
        List<ThreadDTO> threads = threadService.getThreadsBySpace(spaceId, userId);
        return ResponseEntity.ok(threads);
    }
    
    /**
     * Get thread by ID
     * GET /api/threads/{id}?userId=xxx
     */
    @GetMapping("/{id}")
    public ResponseEntity<ThreadDTO> getThreadById(
            @PathVariable String id,
            @RequestParam String userId) {
        ThreadDTO thread = threadService.getThreadById(id, userId);
        return ResponseEntity.ok(thread);
    }
    
    /**
     * Update thread
     * PUT /api/threads/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ThreadDTO> updateThread(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        String title = (String) request.get("title");
        String content = (String) request.get("content");
        List<String> tags = (List<String>) request.get("tags");
        
        if (userId == null || userId.trim().isEmpty()) {
            throw new RuntimeException("User ID is required");
        }
        
        ThreadDTO thread = threadService.updateThread(id, userId, title, content, tags);
        return ResponseEntity.ok(thread);
    }
    
    /**
     * Delete thread
     * DELETE /api/threads/{id}?userId=xxx
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteThread(
            @PathVariable String id,
            @RequestParam String userId) {
        threadService.deleteThread(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Toggle pin status (moderator only)
     * POST /api/threads/{id}/pin?userId=xxx
     */
    @PostMapping("/{id}/pin")
    public ResponseEntity<ThreadDTO> togglePin(
            @PathVariable String id,
            @RequestParam String userId) {
        ThreadDTO thread = threadService.togglePin(id, userId);
        return ResponseEntity.ok(thread);
    }
    
    /**
     * Toggle lock status (moderator only)
     * POST /api/threads/{id}/lock?userId=xxx
     */
    @PostMapping("/{id}/lock")
    public ResponseEntity<ThreadDTO> toggleLock(
            @PathVariable String id,
            @RequestParam String userId) {
        ThreadDTO thread = threadService.toggleLock(id, userId);
        return ResponseEntity.ok(thread);
    }
}
