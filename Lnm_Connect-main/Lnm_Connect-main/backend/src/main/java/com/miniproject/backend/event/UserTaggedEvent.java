package com.miniproject.backend.event;

import org.springframework.context.ApplicationEvent;

public class UserTaggedEvent extends ApplicationEvent {
    private final String taggedUserId;
    private final String taggedUsername;
    private final String taggerUserId;
    private final String taggerUsername;
    private final String entityId;
    private final String entityType; // "post", "comment", "reply"
    private final String content;
    private final String actionUrl;
    
    public UserTaggedEvent(Object source, String taggedUserId, String taggedUsername,
                          String taggerUserId, String taggerUsername,
                          String entityId, String entityType, String content, String actionUrl) {
        super(source);
        this.taggedUserId = taggedUserId;
        this.taggedUsername = taggedUsername;
        this.taggerUserId = taggerUserId;
        this.taggerUsername = taggerUsername;
        this.entityId = entityId;
        this.entityType = entityType;
        this.content = content;
        this.actionUrl = actionUrl;
    }
    
    // Getters
    public String getTaggedUserId() {
        return taggedUserId;
    }
    
    public String getTaggedUsername() {
        return taggedUsername;
    }
    
    public String getTaggerUserId() {
        return taggerUserId;
    }
    
    public String getTaggerUsername() {
        return taggerUsername;
    }
    
    public String getEntityId() {
        return entityId;
    }
    
    public String getEntityType() {
        return entityType;
    }
    
    public String getContent() {
        return content;
    }
    
    public String getActionUrl() {
        return actionUrl;
    }
}
