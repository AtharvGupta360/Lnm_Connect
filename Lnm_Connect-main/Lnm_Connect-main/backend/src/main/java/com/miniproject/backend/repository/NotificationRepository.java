package com.miniproject.backend.repository;

import com.miniproject.backend.model.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    
    // Find notifications for a user with pagination, ordered by creation time
    List<Notification> findByReceiverIdOrderByCreatedAtDesc(String receiverId, Pageable pageable);
    
    // Count unread notifications for a user
    long countByReceiverIdAndIsRead(String receiverId, boolean isRead);
    
    // Find unread notifications for a user
    List<Notification> findByReceiverIdAndIsReadOrderByCreatedAtDesc(String receiverId, boolean isRead, Pageable pageable);
    
    // Mark all notifications as read for a user
    @Query("{'receiverId': ?0, 'isRead': false}")
    List<Notification> findUnreadNotificationsByReceiverId(String receiverId);
    
    // Delete old notifications (cleanup)
    void deleteByReceiverIdAndCreatedAtBefore(String receiverId, long timestamp);
    
    // Find notifications by entity
    List<Notification> findByEntityIdAndEntityType(String entityId, String entityType);
}
