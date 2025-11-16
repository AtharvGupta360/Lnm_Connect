package com.miniproject.backend.listener;

import com.miniproject.backend.event.UserTaggedEvent;
import com.miniproject.backend.event.MessageReceivedEvent;
import com.miniproject.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventListener {
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Listen for UserTaggedEvent and create notification
     */
    @Async
    @EventListener
    public void handleUserTaggedEvent(UserTaggedEvent event) {
        try {
            notificationService.createTagNotification(
                event.getTaggedUserId(),
                event.getTaggerUserId(),
                event.getTaggerUsername(),
                event.getEntityId(),
                event.getEntityType(),
                event.getContent(),
                event.getActionUrl()
            );
        } catch (Exception e) {
            System.err.println("Error handling UserTaggedEvent: " + e.getMessage());
        }
    }
    
    /**
     * Listen for MessageReceivedEvent and create notification
     */
    @Async
    @EventListener
    public void handleMessageReceivedEvent(MessageReceivedEvent event) {
        try {
            notificationService.createMessageNotification(
                event.getReceiverId(),
                event.getSenderId(),
                event.getSenderName(),
                event.getMessageId(),
                event.getMessagePreview(),
                event.getConversationId()
            );
        } catch (Exception e) {
            System.err.println("Error handling MessageReceivedEvent: " + e.getMessage());
        }
    }
}
