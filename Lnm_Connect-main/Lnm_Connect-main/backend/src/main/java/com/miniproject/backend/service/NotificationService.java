package com.miniproject.backend.service;

import com.miniproject.backend.model.Notification;
import com.miniproject.backend.model.Notification.NotificationType;
import com.miniproject.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.HashSet;
import java.util.Set;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final Pattern MENTION_PATTERN = Pattern.compile("@([a-zA-Z0-9_]+)");
    
    /**
     * Create a notification and push it via WebSocket
     */
    public Notification createNotification(Notification notification) {
        Notification saved = notificationRepository.save(notification);
        
        // Push notification to user via WebSocket
        pushNotificationToUser(saved);
        
        return saved;
    }
    
    /**
     * Create a tag notification
     */
    public Notification createTagNotification(String receiverId, String senderId, 
                                             String senderName, String entityId, 
                                             String entityType, String content, String actionUrl) {
        NotificationType type = getTagNotificationType(entityType);
        String message = senderName + " mentioned you in a " + entityType;
        
        Notification notification = new Notification(
            receiverId, senderId, senderName, type, message, entityId, entityType
        );
        notification.setActionUrl(actionUrl);
        notification.setPreviewText(truncateContent(content, 100));
        
        return createNotification(notification);
    }
    
    /**
     * Create a message notification
     */
    public Notification createMessageNotification(String receiverId, String senderId,
                                                  String senderName, String messageId,
                                                  String messagePreview, String conversationId) {
        String message = senderName + " sent you a message";
        String actionUrl = "/chat?conversation=" + conversationId;
        
        Notification notification = new Notification(
            receiverId, senderId, senderName, NotificationType.NEW_MESSAGE,
            message, messageId, "message"
        );
        notification.setActionUrl(actionUrl);
        notification.setPreviewText(truncateContent(messagePreview, 80));
        
        return createNotification(notification);
    }
    
    /**
     * Create notification for new comment
     */
    public Notification createCommentNotification(String receiverId, String senderId,
                                                  String senderName, String postId,
                                                  String commentText) {
        String message = senderName + " commented on your post";
        String actionUrl = "/?postId=" + postId;
        
        Notification notification = new Notification(
            receiverId, senderId, senderName, NotificationType.NEW_COMMENT,
            message, postId, "post"
        );
        notification.setActionUrl(actionUrl);
        notification.setPreviewText(truncateContent(commentText, 100));
        
        return createNotification(notification);
    }
    
    /**
     * Create notification for post like
     */
    public Notification createLikeNotification(String receiverId, String senderId,
                                              String senderName, String postId) {
        String message = senderName + " liked your post";
        String actionUrl = "/?postId=" + postId;
        
        Notification notification = new Notification(
            receiverId, senderId, senderName, NotificationType.POST_LIKE,
            message, postId, "post"
        );
        notification.setActionUrl(actionUrl);
        
        return createNotification(notification);
    }
    
    /**
     * Create notification for new follower
     */
    public Notification createFollowerNotification(String receiverId, String senderId,
                                                   String senderName) {
        String message = senderName + " started following you";
        String actionUrl = "/profile/" + senderId;
        
        Notification notification = new Notification(
            receiverId, senderId, senderName, NotificationType.NEW_FOLLOWER,
            message, senderId, "follow"
        );
        notification.setActionUrl(actionUrl);
        
        return createNotification(notification);
    }
    
    /**
     * Create notification for follow request
     */
    public Notification createFollowRequestNotification(String receiverId, String senderId,
                                                       String senderName) {
        String message = senderName + " sent you a connection request";
        String actionUrl = "/network/requests";
        
        Notification notification = new Notification(
            receiverId, senderId, senderName, NotificationType.FOLLOW_REQUEST,
            message, senderId, "follow"
        );
        notification.setActionUrl(actionUrl);
        
        return createNotification(notification);
    }
    
    /**
     * Create notification for thread reply
     */
    public Notification createThreadReplyNotification(String receiverId, String senderId,
                                                     String senderName, String threadId,
                                                     String replyText) {
        String message = senderName + " replied to your thread";
        String actionUrl = "/threads/" + threadId;
        
        Notification notification = new Notification(
            receiverId, senderId, senderName, NotificationType.THREAD_REPLY,
            message, threadId, "thread"
        );
        notification.setActionUrl(actionUrl);
        notification.setPreviewText(truncateContent(replyText, 100));
        
        return createNotification(notification);
    }
    
    /**
     * Create notification for comment reply
     */
    public Notification createCommentReplyNotification(String receiverId, String senderId,
                                                      String senderName, String commentId,
                                                      String replyText, String postId) {
        String message = senderName + " replied to your comment";
        String actionUrl = "/?highlightPost=" + postId;
        
        Notification notification = new Notification(
            receiverId, senderId, senderName, NotificationType.COMMENT_REPLY,
            message, commentId, "comment"
        );
        notification.setActionUrl(actionUrl);
        notification.setPreviewText(truncateContent(replyText, 100));
        
        return createNotification(notification);
    }
    
    /**
     * Create notification for upvote
     */
    public Notification createUpvoteNotification(String receiverId, String senderId,
                                                String senderName, String entityId,
                                                String entityType) {
        String message = senderName + " upvoted your " + entityType;
        String actionUrl = entityType.equals("thread") 
            ? "/threads/" + entityId 
            : "/?highlightPost=" + entityId;
        
        Notification notification = new Notification(
            receiverId, senderId, senderName, NotificationType.UPVOTE,
            message, entityId, entityType
        );
        notification.setActionUrl(actionUrl);
        
        return createNotification(notification);
    }
    
    /**
     * Get notifications for a user with pagination
     */
    public List<Notification> getNotifications(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size > 0 ? size : DEFAULT_PAGE_SIZE);
        return notificationRepository.findByReceiverIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    /**
     * Get unread notifications count
     */
    public long getUnreadCount(String userId) {
        return notificationRepository.countByReceiverIdAndIsRead(userId, false);
    }
    
    /**
     * Mark notification as read
     */
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            if (!notification.isRead()) {
                notification.setRead(true);
                notificationRepository.save(notification);
                
                // Push updated count to user
                pushUnreadCountUpdate(notification.getReceiverId());
            }
        });
    }
    
    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications = 
            notificationRepository.findUnreadNotificationsByReceiverId(userId);
        
        unreadNotifications.forEach(notification -> {
            notification.setRead(true);
        });
        
        notificationRepository.saveAll(unreadNotifications);
        pushUnreadCountUpdate(userId);
    }
    
    /**
     * Delete a notification
     */
    public void deleteNotification(String notificationId, String userId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            if (notification.getReceiverId().equals(userId)) {
                notificationRepository.delete(notification);
                pushUnreadCountUpdate(userId);
            }
        });
    }
    
    /**
     * Extract mentioned usernames from text
     */
    public Set<String> extractMentions(String text) {
        Set<String> mentions = new HashSet<>();
        if (text == null || text.isEmpty()) {
            return mentions;
        }
        
        Matcher matcher = MENTION_PATTERN.matcher(text);
        while (matcher.find()) {
            mentions.add(matcher.group(1)); // Extract username without @
        }
        return mentions;
    }
    
    /**
     * Push notification to user via WebSocket
     */
    private void pushNotificationToUser(Notification notification) {
        try {
            System.out.println("Pushing notification to user: " + notification.getReceiverId());
            System.out.println("Notification type: " + notification.getType());
            System.out.println("Sender: " + notification.getSenderName());
            
            messagingTemplate.convertAndSendToUser(
                notification.getReceiverId(),
                "/queue/notifications",
                notification
            );
            
            System.out.println("Notification pushed successfully to: " + notification.getReceiverId());
        } catch (Exception e) {
            System.err.println("Failed to push notification via WebSocket: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Push unread count update to user
     */
    private void pushUnreadCountUpdate(String userId) {
        try {
            long unreadCount = getUnreadCount(userId);
            messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/unread-count",
                unreadCount
            );
        } catch (Exception e) {
            System.err.println("Failed to push unread count: " + e.getMessage());
        }
    }
    
    /**
     * Get notification type based on entity type
     */
    private NotificationType getTagNotificationType(String entityType) {
        switch (entityType.toLowerCase()) {
            case "post":
                return NotificationType.TAG_IN_POST;
            case "comment":
                return NotificationType.TAG_IN_COMMENT;
            case "reply":
                return NotificationType.TAG_IN_REPLY;
            default:
                return NotificationType.TAG_IN_POST;
        }
    }
    
    /**
     * Truncate content for preview
     */
    private String truncateContent(String content, int maxLength) {
        if (content == null || content.length() <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + "...";
    }
    
    /**
     * Cleanup old notifications (can be scheduled)
     */
    public void cleanupOldNotifications(String userId, int daysToKeep) {
        long cutoffTime = System.currentTimeMillis() - (daysToKeep * 24L * 60 * 60 * 1000);
        notificationRepository.deleteByReceiverIdAndCreatedAtBefore(userId, cutoffTime);
    }
}
