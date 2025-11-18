package com.miniproject.backend.controller;

import com.miniproject.backend.model.Notification;
import com.miniproject.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Get notifications for a user with pagination
     * GET /api/notifications?userId=xxx&page=0&size=20
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestParam String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Notification> notifications = notificationService.getNotifications(userId, page, size);
        long unreadCount = notificationService.getUnreadCount(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("notifications", notifications);
        response.put("unreadCount", unreadCount);
        response.put("page", page);
        response.put("size", size);
        response.put("hasMore", notifications.size() == size);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get unread notifications count
     * GET /api/notifications/unread-count?userId=xxx
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam String userId) {
        long count = notificationService.getUnreadCount(userId);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Mark notification as read
     * PUT /api/notifications/{id}/read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Mark all notifications as read for a user
     * PUT /api/notifications/mark-all-read?userId=xxx
     */
    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@RequestParam String userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Delete a notification
     * DELETE /api/notifications/{id}?userId=xxx
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable String id,
            @RequestParam String userId
    ) {
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Test notification creation
     * POST /api/notifications/test
     */
    @PostMapping("/test")
    public ResponseEntity<Notification> createTestNotification(
            @RequestParam String receiverId,
            @RequestParam String senderId,
            @RequestParam String senderName,
            @RequestParam String message
    ) {
        Notification notification = new Notification(
            receiverId, senderId, senderName,
            Notification.NotificationType.SYSTEM_ALERT,
            message, null, "test"
        );
        notification.setActionUrl("/");
        
        Notification created = notificationService.createNotification(notification);
        return ResponseEntity.ok(created);
    }
    
    /**
     * Create voice call invite notification
     * POST /api/notifications/voice-invite
     */
    @PostMapping("/voice-invite")
    public ResponseEntity<Notification> createVoiceInvite(
            @RequestBody Map<String, String> request
    ) {
        String receiverId = request.get("receiverId");
        String senderId = request.get("senderId");
        String senderName = request.get("senderName");
        String channelId = request.get("channelId");
        
        Notification notification = new Notification(
            receiverId, senderId, senderName,
            Notification.NotificationType.SYSTEM_ALERT,
            senderName + " invited you to a voice call",
            null, "voice_call_invite"
        );
        notification.setActionUrl("/voice-call?channel=" + channelId);
        
        Notification created = notificationService.createNotification(notification);
        return ResponseEntity.ok(created);
    }
}

