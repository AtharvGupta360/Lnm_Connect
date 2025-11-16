package com.miniproject.backend.config;

import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
public class WebSocketChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Extract userId from connection headers
            String userId = accessor.getFirstNativeHeader("userId");
            
            System.out.println("WebSocket CONNECT command received");
            System.out.println("UserId from header: " + userId);
            
            if (userId != null && !userId.isEmpty()) {
                // Set user principal for this session
                accessor.setUser(new Principal() {
                    @Override
                    public String getName() {
                        return userId;
                    }
                });
                
                System.out.println("✅ WebSocket connection established for user: " + userId);
                System.out.println("Session ID: " + accessor.getSessionId());
            } else {
                System.err.println("❌ No userId found in WebSocket connection headers!");
            }
        }
        
        return message;
    }
}
