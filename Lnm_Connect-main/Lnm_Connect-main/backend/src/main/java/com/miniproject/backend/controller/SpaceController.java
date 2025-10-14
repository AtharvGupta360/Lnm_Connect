package com.miniproject.backend.controller;

import com.miniproject.backend.dto.SpaceDTO;
import com.miniproject.backend.service.SpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Space (Forum) management
 */
@RestController
@RequestMapping("/api/spaces")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SpaceController {
    
    private final SpaceService spaceService;
    
    /**
     * Create a new space
     * POST /api/spaces
     */
    @PostMapping
    public ResponseEntity<SpaceDTO> createSpace(@RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        String name = (String) request.get("name");
        String description = (String) request.get("description");
        List<String> rules = (List<String>) request.get("rules");
        List<String> tags = (List<String>) request.get("tags");
        
        // Validate required fields
        if (userId == null || userId.trim().isEmpty()) {
            throw new RuntimeException("User ID is required");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Space name is required");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new RuntimeException("Space description is required");
        }
        
        SpaceDTO space = spaceService.createSpace(userId, name, description, rules, tags);
        return ResponseEntity.status(HttpStatus.CREATED).body(space);
    }
    
    /**
     * Get all spaces
     * GET /api/spaces?userId=xxx
     */
    @GetMapping
    public ResponseEntity<List<SpaceDTO>> getAllSpaces(@RequestParam String userId) {
        List<SpaceDTO> spaces = spaceService.getAllSpaces(userId);
        return ResponseEntity.ok(spaces);
    }
    
    /**
     * Get space by ID
     * GET /api/spaces/{id}?userId=xxx
     */
    @GetMapping("/{id}")
    public ResponseEntity<SpaceDTO> getSpaceById(@PathVariable String id, @RequestParam String userId) {
        SpaceDTO space = spaceService.getSpaceById(id, userId);
        return ResponseEntity.ok(space);
    }
    
    /**
     * Join a space
     * POST /api/spaces/{id}/join
     */
    @PostMapping("/{id}/join")
    public ResponseEntity<String> joinSpace(@PathVariable String id, @RequestParam String userId) {
        spaceService.joinSpace(id, userId);
        return ResponseEntity.ok("Joined space successfully");
    }
    
    /**
     * Leave a space
     * POST /api/spaces/{id}/leave
     */
    @PostMapping("/{id}/leave")
    public ResponseEntity<String> leaveSpace(@PathVariable String id, @RequestParam String userId) {
        spaceService.leaveSpace(id, userId);
        return ResponseEntity.ok("Left space successfully");
    }
    
    /**
     * Get user's joined spaces
     * GET /api/spaces/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SpaceDTO>> getUserSpaces(@PathVariable String userId) {
        List<SpaceDTO> spaces = spaceService.getUserSpaces(userId);
        return ResponseEntity.ok(spaces);
    }
}
