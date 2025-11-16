package com.miniproject.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;

@Document(collection = "notifications")
@CompoundIndexes({
    @CompoundIndex(name = "receiver_read_idx", def = "{'receiverId': 1, 'isRead': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "receiver_created_idx", def = "{'receiverId': 1, 'createdAt': -1}")
})
public class Notification {
    @Id
    private String id;
    
    @Indexed
    private String receiverId;
    
    private String senderId;
    private String senderName;
    private String senderAvatar;
    
    private NotificationType type;
    private String message;
    
    // Reference to the related entity (post, comment, message, etc.)
    private String entityId;
    private String entityType; // "post", "comment", "message", "follow"
    
    @Indexed
    private boolean isRead;
    
    @Indexed
    private long createdAt;
    
    // Additional metadata
    private String actionUrl; // URL to navigate when clicked
    private String previewText; // Preview of the content
    
    public enum NotificationType {
        TAG_IN_POST,
        TAG_IN_COMMENT,
        TAG_IN_REPLY,
        NEW_MESSAGE,
        NEW_COMMENT,
        POST_LIKE,
        COMMENT_LIKE,
        NEW_FOLLOWER,
        FOLLOW_REQUEST,
        APPLICATION_STATUS,
        SYSTEM_ALERT,
        THREAD_REPLY,
        COMMENT_REPLY,
        UPVOTE,
        THREAD_MENTION,
        VOICE_CHANNEL_INVITE
    }
    
    // Constructors
    public Notification() {
        this.createdAt = System.currentTimeMillis();
        this.isRead = false;
    }
    
    public Notification(String receiverId, String senderId, String senderName, 
                       NotificationType type, String message, String entityId, String entityType) {
        this();
        this.receiverId = receiverId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.type = type;
        this.message = message;
        this.entityId = entityId;
        this.entityType = entityType;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getReceiverId() {
        return receiverId;
    }
    
    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
    }
    
    public String getSenderId() {
        return senderId;
    }
    
    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }
    
    public String getSenderName() {
        return senderName;
    }
    
    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }
    
    public String getSenderAvatar() {
        return senderAvatar;
    }
    
    public void setSenderAvatar(String senderAvatar) {
        this.senderAvatar = senderAvatar;
    }
    
    public NotificationType getType() {
        return type;
    }
    
    public void setType(NotificationType type) {
        this.type = type;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getEntityId() {
        return entityId;
    }
    
    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }
    
    public String getEntityType() {
        return entityType;
    }
    
    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }
    
    public boolean isRead() {
        return isRead;
    }
    
    public void setRead(boolean read) {
        isRead = read;
    }
    
    public long getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getActionUrl() {
        return actionUrl;
    }
    
    public void setActionUrl(String actionUrl) {
        this.actionUrl = actionUrl;
    }
    
    public String getPreviewText() {
        return previewText;
    }
    
    public void setPreviewText(String previewText) {
        this.previewText = previewText;
    }
}
