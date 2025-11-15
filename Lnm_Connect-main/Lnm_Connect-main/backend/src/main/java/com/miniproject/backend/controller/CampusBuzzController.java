package com.miniproject.backend.controller;

import com.miniproject.backend.model.CampusBuzz;
import com.miniproject.backend.repository.CampusBuzzRepository;
import com.miniproject.backend.repository.UserRepository;
import com.miniproject.backend.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/campus-buzz")
@CrossOrigin(origins = "*")
public class CampusBuzzController {

    @Autowired
    private CampusBuzzRepository campusBuzzRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all campus buzz items
     */
    @GetMapping
    public ResponseEntity<List<CampusBuzz>> getAllBuzz() {
        List<CampusBuzz> allBuzz = campusBuzzRepository.findAll();
        // Sort by pinned first, then priority, then date
        allBuzz.sort((a, b) -> {
            if (a.isPinned() != b.isPinned()) {
                return a.isPinned() ? -1 : 1;
            }
            if (a.getPriority() != b.getPriority()) {
                return Integer.compare(b.getPriority(), a.getPriority());
            }
            return Long.compare(b.getEventDate(), a.getEventDate());
        });
        return ResponseEntity.ok(allBuzz);
    }

    /**
     * Get buzz by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<CampusBuzz>> getBuzzByCategory(@PathVariable String category) {
        List<CampusBuzz> buzz = campusBuzzRepository.findByCategory(category.toUpperCase());
        return ResponseEntity.ok(buzz);
    }

    /**
     * Get upcoming events
     */
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingEvents() {
        try {
            long currentTime = System.currentTimeMillis();
            List<CampusBuzz> upcoming = campusBuzzRepository.findUpcomingEvents(currentTime);
            if (upcoming == null) {
                upcoming = new ArrayList<>();
            }
            upcoming.sort(Comparator.comparingLong(CampusBuzz::getEventDate));
            return ResponseEntity.ok(upcoming.stream().limit(10).collect(Collectors.toList()));
        } catch (Exception e) {
            System.err.println("Error fetching upcoming events: " + e.getMessage());
            e.printStackTrace();
            // Return empty list instead of error to prevent frontend crash
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    /**
     * Get recent buzz (last 10)
     */
    @GetMapping("/recent")
    public ResponseEntity<List<CampusBuzz>> getRecentBuzz() {
        List<CampusBuzz> recent = campusBuzzRepository.findTop10ByOrderByCreatedAtDesc();
        return ResponseEntity.ok(recent);
    }

    /**
     * Get pinned announcements
     */
    @GetMapping("/pinned")
    public ResponseEntity<List<CampusBuzz>> getPinnedAnnouncements() {
        List<CampusBuzz> pinned = campusBuzzRepository.findByIsPinnedTrue();
        pinned.sort((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()));
        return ResponseEntity.ok(pinned);
    }

    /**
     * Create new buzz
     */
    @PostMapping
    public ResponseEntity<?> createBuzz(@RequestBody CampusBuzz buzz, @RequestParam String userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }
            
            buzz.setAuthorId(userId);
            buzz.setAuthorName(user.getName());
            buzz.setCreatedAt(System.currentTimeMillis());
            
            CampusBuzz saved = campusBuzzRepository.save(buzz);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update buzz
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBuzz(@PathVariable String id, @RequestBody CampusBuzz updatedBuzz) {
        return campusBuzzRepository.findById(id)
                .map(buzz -> {
                    buzz.setTitle(updatedBuzz.getTitle());
                    buzz.setDescription(updatedBuzz.getDescription());
                    buzz.setCategory(updatedBuzz.getCategory());
                    buzz.setImageUrl(updatedBuzz.getImageUrl());
                    buzz.setLink(updatedBuzz.getLink());
                    buzz.setEventDate(updatedBuzz.getEventDate());
                    buzz.setVenue(updatedBuzz.getVenue());
                    buzz.setPriority(updatedBuzz.getPriority());
                    buzz.setPinned(updatedBuzz.isPinned());
                    return ResponseEntity.ok(campusBuzzRepository.save(buzz));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete buzz
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBuzz(@PathVariable String id) {
        campusBuzzRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }

    /**
     * Like/Unlike buzz
     */
    @PostMapping("/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable String id, @RequestParam String userId) {
        return campusBuzzRepository.findById(id)
                .map(buzz -> {
                    Set<String> likes = buzz.getLikes();
                    if (likes.contains(userId)) {
                        likes.remove(userId);
                    } else {
                        likes.add(userId);
                    }
                    buzz.setLikes(likes);
                    campusBuzzRepository.save(buzz);
                    return ResponseEntity.ok(Map.of("liked", likes.contains(userId), "likeCount", likes.size()));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get buzz statistics by category
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getBuzzStats() {
        List<CampusBuzz> allBuzz = campusBuzzRepository.findAll();
        Map<String, Long> stats = allBuzz.stream()
                .collect(Collectors.groupingBy(CampusBuzz::getCategory, Collectors.counting()));
        
        Map<String, Object> response = new HashMap<>();
        response.put("total", allBuzz.size());
        response.put("byCategory", stats);
        response.put("pinned", allBuzz.stream().filter(CampusBuzz::isPinned).count());
        
        return ResponseEntity.ok(response);
    }
}
