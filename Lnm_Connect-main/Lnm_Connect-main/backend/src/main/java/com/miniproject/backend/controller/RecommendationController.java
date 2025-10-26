package com.miniproject.backend.controller;

import com.miniproject.backend.dto.EventRecommendationDTO;
import com.miniproject.backend.dto.ProfileRecommendationDTO;
import com.miniproject.backend.dto.ProjectRecommendationDTO;
import com.miniproject.backend.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {
    
    @Autowired
    private RecommendationService recommendationService;
    
    /**
     * GET /api/recommendations/profiles/{userId}
     * Get profile recommendations for a user
     */
    @GetMapping("/profiles/{userId}")
    public ResponseEntity<?> getProfileRecommendations(@PathVariable String userId) {
        try {
            List<ProfileRecommendationDTO> recommendations = 
                recommendationService.generateProfileRecommendations(userId);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Error generating profile recommendations: " + e.getMessage());
        }
    }
    
    /**
     * GET /api/recommendations/projects/{userId}
     * Get project recommendations for a user
     */
    @GetMapping("/projects/{userId}")
    public ResponseEntity<?> getProjectRecommendations(@PathVariable String userId) {
        try {
            List<ProjectRecommendationDTO> recommendations = 
                recommendationService.generateProjectRecommendations(userId);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Error generating project recommendations: " + e.getMessage());
        }
    }
    
    /**
     * GET /api/recommendations/events/{userId}
     * Get event recommendations for a user
     */
    @GetMapping("/events/{userId}")
    public ResponseEntity<?> getEventRecommendations(@PathVariable String userId) {
        try {
            List<EventRecommendationDTO> recommendations = 
                recommendationService.generateEventRecommendations(userId);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Error generating event recommendations: " + e.getMessage());
        }
    }
    
    /**
     * POST /api/recommendations/refresh/{userId}
     * Refresh all recommendations for a user
     */
    @PostMapping("/refresh/{userId}")
    public ResponseEntity<?> refreshRecommendations(@PathVariable String userId) {
        try {
            recommendationService.refreshRecommendations(userId);
            return ResponseEntity.ok("Recommendations refreshed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Error refreshing recommendations: " + e.getMessage());
        }
    }
    
    /**
     * GET /api/recommendations/all/{userId}
     * Get all recommendations at once (profiles, projects, events)
     */
    @GetMapping("/all/{userId}")
    public ResponseEntity<?> getAllRecommendations(@PathVariable String userId) {
        try {
            java.util.Map<String, Object> allRecommendations = new java.util.HashMap<>();
            allRecommendations.put("profiles", recommendationService.generateProfileRecommendations(userId));
            allRecommendations.put("projects", recommendationService.generateProjectRecommendations(userId));
            allRecommendations.put("events", recommendationService.generateEventRecommendations(userId));
            return ResponseEntity.ok(allRecommendations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Error generating recommendations: " + e.getMessage());
        }
    }
}
