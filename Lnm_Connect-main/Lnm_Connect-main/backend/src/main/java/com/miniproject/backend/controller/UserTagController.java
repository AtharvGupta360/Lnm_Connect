package com.miniproject.backend.controller;

import com.miniproject.backend.model.UserTag;
import com.miniproject.backend.service.UserTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for User Tags/Mentions
 */
@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserTagController {
    
    private final UserTagService userTagService;
    
    /**
     * Create tags for mentioned users
     * POST /api/tags
     */
    @PostMapping
    public ResponseEntity<List<UserTag>> createTags(@RequestBody Map<String, Object> request) {
        String taggerUserId = (String) request.get("taggerUserId");
        List<String> taggedUserIds = (List<String>) request.get("taggedUserIds");
        String contentId = (String) request.get("contentId");
        String contentType = (String) request.get("contentType");
        String content = (String) request.get("content");
        
        List<UserTag> tags = userTagService.createTags(
            taggerUserId, taggedUserIds, contentId, contentType, content
        );
        
        return ResponseEntity.ok(tags);
    }
    
    /**
     * Get all tags for a user
     * GET /api/tags/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserTag>> getTagsForUser(@PathVariable String userId) {
        List<UserTag> tags = userTagService.getTagsForUser(userId);
        return ResponseEntity.ok(tags);
    }
    
    /**
     * Get unread tags for a user
     * GET /api/tags/user/{userId}/unread
     */
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<UserTag>> getUnreadTagsForUser(@PathVariable String userId) {
        List<UserTag> tags = userTagService.getUnreadTagsForUser(userId);
        return ResponseEntity.ok(tags);
    }
    
    /**
     * Get unread tag count
     * GET /api/tags/user/{userId}/count
     */
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Map<String, Long>> getUnreadTagCount(@PathVariable String userId) {
        Long count = userTagService.getUnreadTagCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    /**
     * Mark tags as read
     * POST /api/tags/mark-read
     */
    @PostMapping("/mark-read")
    public ResponseEntity<String> markTagsAsRead(@RequestBody Map<String, List<String>> request) {
        List<String> tagIds = request.get("tagIds");
        userTagService.markTagsAsRead(tagIds);
        return ResponseEntity.ok("Tags marked as read");
    }
}
