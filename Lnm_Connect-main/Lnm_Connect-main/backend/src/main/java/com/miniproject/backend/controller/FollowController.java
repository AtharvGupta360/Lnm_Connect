package com.miniproject.backend.controller;

import com.miniproject.backend.dto.FollowRequestDTO;
import com.miniproject.backend.dto.FollowStatusDTO;
import com.miniproject.backend.dto.UserConnectionDTO;
import com.miniproject.backend.model.Follow;
import com.miniproject.backend.service.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/follow")
@CrossOrigin(origins = "*")
public class FollowController {

    @Autowired
    private FollowService followService;

    /**
     * Send follow/connect request
     * POST /api/follow/{targetUserId}?userId={currentUserId}
     */
    @PostMapping("/{targetUserId}")
    public ResponseEntity<?> sendFollowRequest(
            @PathVariable String targetUserId,
            @RequestParam String userId) {
        try {
            Follow follow = followService.sendFollowRequest(userId, targetUserId);
            return ResponseEntity.ok(follow);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send follow request"));
        }
    }

    /**
     * Accept follow/connect request
     * POST /api/follow/{requestId}/accept?userId={currentUserId}
     */
    @PostMapping("/{requestId}/accept")
    public ResponseEntity<?> acceptFollowRequest(
            @PathVariable String requestId,
            @RequestParam String userId) {
        try {
            Follow follow = followService.acceptFollowRequest(requestId, userId);
            return ResponseEntity.ok(follow);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to accept request"));
        }
    }

    /**
     * Reject follow/connect request
     * POST /api/follow/{requestId}/reject?userId={currentUserId}
     */
    @PostMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectFollowRequest(
            @PathVariable String requestId,
            @RequestParam String userId) {
        try {
            followService.rejectFollowRequest(requestId, userId);
            return ResponseEntity.ok(Map.of("message", "Request rejected successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to reject request"));
        }
    }

    /**
     * Unfollow or remove connection
     * DELETE /api/follow/{targetUserId}?userId={currentUserId}
     */
    @DeleteMapping("/{targetUserId}")
    public ResponseEntity<?> unfollowUser(
            @PathVariable String targetUserId,
            @RequestParam String userId) {
        try {
            followService.unfollowUser(userId, targetUserId);
            return ResponseEntity.ok(Map.of("message", "Unfollowed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to unfollow"));
        }
    }

    /**
     * Get follow status between current user and target user
     * GET /api/follow/status/{targetUserId}?userId={currentUserId}
     */
    @GetMapping("/status/{targetUserId}")
    public ResponseEntity<FollowStatusDTO> getFollowStatus(
            @PathVariable String targetUserId,
            @RequestParam String userId) {
        FollowStatusDTO status = followService.getFollowStatus(userId, targetUserId);
        return ResponseEntity.ok(status);
    }

    /**
     * Get pending connection requests received by user
     * GET /api/follow/requests?userId={currentUserId}
     */
    @GetMapping("/requests")
    public ResponseEntity<List<FollowRequestDTO>> getPendingRequests(@RequestParam String userId) {
        List<FollowRequestDTO> requests = followService.getPendingRequests(userId);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get list of followers
     * GET /api/follow/followers/{userId}
     */
    @GetMapping("/followers/{userId}")
    public ResponseEntity<List<UserConnectionDTO>> getFollowers(@PathVariable String userId) {
        List<UserConnectionDTO> followers = followService.getFollowers(userId);
        return ResponseEntity.ok(followers);
    }

    /**
     * Get list of following
     * GET /api/follow/following/{userId}
     */
    @GetMapping("/following/{userId}")
    public ResponseEntity<List<UserConnectionDTO>> getFollowing(@PathVariable String userId) {
        List<UserConnectionDTO> following = followService.getFollowing(userId);
        return ResponseEntity.ok(following);
    }

    /**
     * Get list of mutual connections
     * GET /api/follow/connections/{userId}
     */
    @GetMapping("/connections/{userId}")
    public ResponseEntity<List<UserConnectionDTO>> getConnections(@PathVariable String userId) {
        List<UserConnectionDTO> connections = followService.getConnections(userId);
        return ResponseEntity.ok(connections);
    }

    /**
     * Get follower, following, and connection counts
     * GET /api/follow/counts/{userId}
     */
    @GetMapping("/counts/{userId}")
    public ResponseEntity<Map<String, Long>> getUserCounts(@PathVariable String userId) {
        Map<String, Long> counts = followService.getUserCounts(userId);
        return ResponseEntity.ok(counts);
    }
}
