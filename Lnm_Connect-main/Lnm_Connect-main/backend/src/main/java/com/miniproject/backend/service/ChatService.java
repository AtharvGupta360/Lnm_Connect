package com.miniproject.backend.service;

import com.miniproject.backend.dto.ChatConversationDTO;
import com.miniproject.backend.dto.MessageDTO;
import com.miniproject.backend.dto.SendMessageRequest;
import com.miniproject.backend.model.ChatRoom;
import com.miniproject.backend.model.Message;
import com.miniproject.backend.model.User;
import com.miniproject.backend.repository.ChatRoomRepository;
import com.miniproject.backend.repository.MessageRepository;
import com.miniproject.backend.repository.UserRepository;
import com.miniproject.backend.event.MessageReceivedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    
    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ApplicationEventPublisher eventPublisher;
    
    /**
     * Get or create a chat room between two users
     */
    @Transactional
    public String getOrCreateChatRoom(String user1Id, String user2Id) {
        // Check if chat room already exists
        return chatRoomRepository.findByUsers(user1Id, user2Id)
                .map(ChatRoom::getId)
                .orElseGet(() -> {
                    // Create new chat room
                    ChatRoom chatRoom = new ChatRoom(user1Id, user2Id);
                    return chatRoomRepository.save(chatRoom).getId();
                });
    }
    
    /**
     * Send a message
     */
    @Transactional
    public MessageDTO sendMessage(String senderId, SendMessageRequest request) {
        // Get or create chat room
        String chatRoomId = getOrCreateChatRoom(senderId, request.getReceiverId());
        
        // Create message
        Message message = new Message(
                chatRoomId,
                senderId,
                request.getReceiverId(),
                request.getContent()
        );
        message.setAttachmentUrl(request.getAttachmentUrl());
        final Message savedMessage = messageRepository.save(message);
        
        // Update chat room's last message time
        chatRoomRepository.findById(chatRoomId).ifPresent(chatRoom -> {
            chatRoom.setLastMessageAt(LocalDateTime.now());
            chatRoomRepository.save(chatRoom);
        });
        
        // Convert to DTO with user details
        MessageDTO messageDTO = convertToMessageDTO(savedMessage);
        
        // Send real-time notification via WebSocket
        messagingTemplate.convertAndSend(
                "/topic/messages/" + chatRoomId,
                messageDTO
        );
        
        // Also notify receiver about new conversation
        messagingTemplate.convertAndSendToUser(
                request.getReceiverId(),
                "/queue/notifications",
                messageDTO
        );
        
        // Publish MessageReceivedEvent for notification system
        userRepository.findById(senderId).ifPresent(sender -> {
            String messagePreview = request.getContent().length() > 50 
                ? request.getContent().substring(0, 50) + "..." 
                : request.getContent();
                
            eventPublisher.publishEvent(new MessageReceivedEvent(
                this,
                request.getReceiverId(),
                senderId,
                sender.getName(),
                savedMessage.getId(),
                messagePreview,
                chatRoomId
            ));
        });
        
        return messageDTO;
    }
    
    /**
     * Get all messages in a chat room
     */
    public List<MessageDTO> getChatRoomMessages(String chatRoomId, String userId) {
        // Verify user has access to this chat room
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        
        if (!chatRoom.containsUser(userId)) {
            throw new RuntimeException("Access denied to this chat room");
        }
        
        List<Message> messages = messageRepository.findByChatRoomIdOrderByTimestampAsc(chatRoomId);
        return messages.stream()
                .map(this::convertToMessageDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all conversations for a user
     */
    public List<ChatConversationDTO> getUserConversations(String userId) {
        List<ChatRoom> chatRooms = chatRoomRepository.findByUserId(userId);
        List<ChatConversationDTO> conversations = new ArrayList<>();
        
        for (ChatRoom chatRoom : chatRooms) {
            String otherUserId = chatRoom.getOtherUserId(userId);
            User otherUser = userRepository.findById(otherUserId).orElse(null);
            
            if (otherUser == null) continue;
            
            Message lastMessage = messageRepository.findTopByChatRoomIdOrderByTimestampDesc(chatRoom.getId());
            long unreadCount = messageRepository.countByChatRoomIdAndReceiverIdAndStatusNot(
                    chatRoom.getId(), 
                    userId, 
                    Message.MessageStatus.READ
            );
            
            ChatConversationDTO dto = new ChatConversationDTO();
            dto.setChatRoomId(chatRoom.getId());
            dto.setOtherUserId(otherUser.getId());
            dto.setOtherUserName(otherUser.getName());
            dto.setOtherUserPhotoUrl(otherUser.getPhotoUrl());
            
            if (lastMessage != null) {
                dto.setLastMessage(lastMessage.getContent());
                dto.setLastMessageTime(lastMessage.getTimestamp());
                dto.setLastMessageStatus(lastMessage.getStatus());
                dto.setLastMessageFromMe(lastMessage.getSenderId().equals(userId));
            }
            
            dto.setUnreadCount(unreadCount);
            conversations.add(dto);
        }
        
        // Sort by last message time (most recent first)
        conversations.sort(Comparator.comparing(ChatConversationDTO::getLastMessageTime,
                Comparator.nullsLast(Comparator.reverseOrder())));
        
        return conversations;
    }
    
    /**
     * Mark messages as read
     */
    @Transactional
    public void markMessagesAsRead(String chatRoomId, String userId) {
        List<Message> unreadMessages = messageRepository.findByChatRoomIdAndReceiverIdAndStatus(
                chatRoomId, 
                userId, 
                Message.MessageStatus.DELIVERED
        );
        
        if (!unreadMessages.isEmpty()) {
            unreadMessages.forEach(msg -> msg.setStatus(Message.MessageStatus.READ));
            messageRepository.saveAll(unreadMessages);
            
            // Notify sender about read status
            for (Message msg : unreadMessages) {
                MessageDTO dto = convertToMessageDTO(msg);
                messagingTemplate.convertAndSend(
                        "/topic/messages/" + chatRoomId,
                        dto
                );
            }
        }
    }
    
    /**
     * Mark messages as delivered
     */
    @Transactional
    public void markMessagesAsDelivered(String chatRoomId, String userId) {
        List<Message> sentMessages = messageRepository.findByChatRoomIdAndReceiverIdAndStatus(
                chatRoomId, 
                userId, 
                Message.MessageStatus.SENT
        );
        
        if (!sentMessages.isEmpty()) {
            sentMessages.forEach(msg -> msg.setStatus(Message.MessageStatus.DELIVERED));
            messageRepository.saveAll(sentMessages);
            
            // Notify sender about delivery status
            for (Message msg : sentMessages) {
                MessageDTO dto = convertToMessageDTO(msg);
                messagingTemplate.convertAndSend(
                        "/topic/messages/" + chatRoomId,
                        dto
                );
            }
        }
    }
    
    /**
     * Convert Message entity to MessageDTO with user details
     */
    private MessageDTO convertToMessageDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setChatRoomId(message.getChatRoomId());
        dto.setSenderId(message.getSenderId());
        dto.setReceiverId(message.getReceiverId());
        dto.setContent(message.getContent());
        dto.setAttachmentUrl(message.getAttachmentUrl());
        dto.setTimestamp(message.getTimestamp());
        dto.setStatus(message.getStatus());
        
        // Add sender details
        userRepository.findById(message.getSenderId()).ifPresent(sender -> {
            dto.setSenderName(sender.getName());
            dto.setSenderPhotoUrl(sender.getPhotoUrl());
        });
        
        // Add receiver details
        userRepository.findById(message.getReceiverId()).ifPresent(receiver -> {
            dto.setReceiverName(receiver.getName());
            dto.setReceiverPhotoUrl(receiver.getPhotoUrl());
        });
        
        return dto;
    }
}
