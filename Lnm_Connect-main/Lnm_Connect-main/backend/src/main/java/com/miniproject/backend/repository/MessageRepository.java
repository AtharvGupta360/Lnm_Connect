package com.miniproject.backend.repository;

import com.miniproject.backend.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    
    List<Message> findByChatRoomIdOrderByTimestampAsc(String chatRoomId);
    
    @Query("{ 'chatRoomId': ?0, $or: [ { 'timestamp': { $gt: ?1 } }, { 'timestamp': ?1 } ] }")
    List<Message> findByChatRoomIdAndTimestampAfter(String chatRoomId, java.time.LocalDateTime timestamp);
    
    Message findTopByChatRoomIdOrderByTimestampDesc(String chatRoomId);
    
    long countByChatRoomIdAndReceiverIdAndStatusNot(String chatRoomId, String receiverId, Message.MessageStatus status);
    
    List<Message> findByChatRoomIdAndReceiverIdAndStatus(String chatRoomId, String receiverId, Message.MessageStatus status);
}
