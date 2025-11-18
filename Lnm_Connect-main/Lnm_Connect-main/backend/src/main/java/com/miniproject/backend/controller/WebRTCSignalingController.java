package com.miniproject.backend.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class WebRTCSignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    public WebRTCSignalingController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Handle WebRTC offer
     * Client sends: { from, to, channelId, offer: { type, sdp } }
     */
    @MessageMapping("/voice-channel/{channelId}/offer")
    public void handleOffer(@DestinationVariable String channelId, @Payload Map<String, Object> message) {
        String fromUserId = (String) message.get("from");
        String toUserId = (String) message.get("to");
        
        System.out.println("📤 WebRTC Offer received - Channel: " + channelId + ", From: " + fromUserId + " → To: " + toUserId);
        
        // Forward the offer to the target user
        messagingTemplate.convertAndSendToUser(
            toUserId,
            "/queue/voice-channel/offer",
            message
        );
        
        System.out.println("✅ Offer forwarded to user: " + toUserId);
    }

    /**
     * Handle WebRTC answer
     * Client sends: { from, to, channelId, answer: { type, sdp } }
     */
    @MessageMapping("/voice-channel/{channelId}/answer")
    public void handleAnswer(@DestinationVariable String channelId, @Payload Map<String, Object> message) {
        String fromUserId = (String) message.get("from");
        String toUserId = (String) message.get("to");
        
        System.out.println("📤 WebRTC Answer received - Channel: " + channelId + ", From: " + fromUserId + " → To: " + toUserId);
        
        // Forward the answer to the target user
        messagingTemplate.convertAndSendToUser(
            toUserId,
            "/queue/voice-channel/answer",
            message
        );
        
        System.out.println("✅ Answer forwarded to user: " + toUserId);
    }

    /**
     * Handle ICE candidate
     * Client sends: { from, to, channelId, candidate: { candidate, sdpMLineIndex, sdpMid } }
     */
    @MessageMapping("/voice-channel/{channelId}/ice-candidate")
    public void handleIceCandidate(@DestinationVariable String channelId, @Payload Map<String, Object> message) {
        String toUserId = (String) message.get("to");
        
        // Forward the ICE candidate to the target user
        messagingTemplate.convertAndSendToUser(
            toUserId,
            "/queue/voice-channel/ice-candidate",
            message
        );
    }

    /**
     * Handle user joining channel (notify other participants)
     */
    @MessageMapping("/voice-channel/{channelId}/user-joined")
    public void handleUserJoined(@DestinationVariable String channelId, @Payload Map<String, Object> message) {
        // Broadcast to all users in the channel
        messagingTemplate.convertAndSend(
            "/topic/voice-channel/" + channelId + "/user-joined",
            message
        );
    }

    /**
     * Handle user leaving channel (notify other participants)
     */
    @MessageMapping("/voice-channel/{channelId}/user-left")
    public void handleUserLeft(@DestinationVariable String channelId, @Payload Map<String, Object> message) {
        // Broadcast to all users in the channel
        messagingTemplate.convertAndSend(
            "/topic/voice-channel/" + channelId + "/user-left",
            message
        );
    }
}
