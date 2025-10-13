package com.miniproject.backend.controller;

import com.miniproject.backend.dto.ChatConversationDTO;
import com.miniproject.backend.dto.MessageDTO;
import com.miniproject.backend.dto.SendMessageRequest;
import com.miniproject.backend.model.TypingIndicator;
import com.miniproject.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {
    
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Get all conversations for the logged-in user
     * GET /api/chats?userId={userId}
     */
    @GetMapping
    public ResponseEntity<List<ChatConversationDTO>> getUserConversations(
            @RequestParam String userId) {
        List<ChatConversationDTO> conversations = chatService.getUserConversations(userId);
        return ResponseEntity.ok(conversations);
    }
    
    /**
     * Get or create a chat room between two users
     * GET /api/chats/room?user1Id={user1Id}&user2Id={user2Id}
     */
    @GetMapping("/room")
    public ResponseEntity<String> getChatRoom(
            @RequestParam String user1Id,
            @RequestParam String user2Id) {
        String chatRoomId = chatService.getOrCreateChatRoom(user1Id, user2Id);
        return ResponseEntity.ok(chatRoomId);
    }
    
    /**
     * Get all messages in a chat room
     * GET /api/chats/{chatRoomId}?userId={userId}
     */
    @GetMapping("/{chatRoomId}")
    public ResponseEntity<List<MessageDTO>> getChatRoomMessages(
            @PathVariable String chatRoomId,
            @RequestParam String userId) {
        List<MessageDTO> messages = chatService.getChatRoomMessages(chatRoomId, userId);
        return ResponseEntity.ok(messages);
    }
    
    /**
     * Send a message
     * POST /api/chats/send?senderId={senderId}
     */
    @PostMapping("/send")
    public ResponseEntity<MessageDTO> sendMessage(
            @RequestParam String senderId,
            @RequestBody SendMessageRequest request) {
        MessageDTO message = chatService.sendMessage(senderId, request);
        return ResponseEntity.ok(message);
    }
    
    /**
     * Mark messages as read
     * PUT /api/chats/{chatRoomId}/read?userId={userId}
     */
    @PutMapping("/{chatRoomId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable String chatRoomId,
            @RequestParam String userId) {
        chatService.markMessagesAsRead(chatRoomId, userId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Mark messages as delivered
     * PUT /api/chats/{chatRoomId}/delivered?userId={userId}
     */
    @PutMapping("/{chatRoomId}/delivered")
    public ResponseEntity<Void> markAsDelivered(
            @PathVariable String chatRoomId,
            @RequestParam String userId) {
        chatService.markMessagesAsDelivered(chatRoomId, userId);
        return ResponseEntity.ok().build();
    }
    
    // ==================== WebSocket Endpoints ====================
    
    /**
     * WebSocket endpoint to send a message
     * Usage: /app/chat.sendMessage
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessageViaWebSocket(@Payload SendMessageRequest request) {
        // This would need the sender ID from the WebSocket session
        // For now, it's handled via REST API
    }
    
    /**
     * WebSocket endpoint for typing indicator
     * Usage: /app/chat.typing/{chatRoomId}
     */
    @MessageMapping("/chat.typing/{chatRoomId}")
    public void handleTypingIndicator(
            @DestinationVariable String chatRoomId,
            @Payload TypingIndicator indicator) {
        messagingTemplate.convertAndSend(
                "/topic/typing/" + chatRoomId,
                indicator
        );
    }
    
    /**
     * WebSocket endpoint when user joins a chat room
     * Usage: /app/chat.join/{chatRoomId}
     */
    @MessageMapping("/chat.join/{chatRoomId}")
    public void joinChatRoom(
            @DestinationVariable String chatRoomId,
            @Payload String userId) {
        // Mark messages as delivered when user joins
        chatService.markMessagesAsDelivered(chatRoomId, userId);
    }
}
