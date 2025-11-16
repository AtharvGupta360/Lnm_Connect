package com.miniproject.backend.event;

import org.springframework.context.ApplicationEvent;

public class MessageReceivedEvent extends ApplicationEvent {
    private final String receiverId;
    private final String senderId;
    private final String senderName;
    private final String messageId;
    private final String messagePreview;
    private final String conversationId;
    
    public MessageReceivedEvent(Object source, String receiverId, String senderId,
                               String senderName, String messageId, 
                               String messagePreview, String conversationId) {
        super(source);
        this.receiverId = receiverId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.messageId = messageId;
        this.messagePreview = messagePreview;
        this.conversationId = conversationId;
    }
    
    // Getters
    public String getReceiverId() {
        return receiverId;
    }
    
    public String getSenderId() {
        return senderId;
    }
    
    public String getSenderName() {
        return senderName;
    }
    
    public String getMessageId() {
        return messageId;
    }
    
    public String getMessagePreview() {
        return messagePreview;
    }
    
    public String getConversationId() {
        return conversationId;
    }
}
