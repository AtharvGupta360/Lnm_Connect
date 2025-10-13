package com.miniproject.backend.repository;

import com.miniproject.backend.model.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {
    
    @Query("{ $or: [ " +
           "{ $and: [ { 'user1Id': ?0 }, { 'user2Id': ?1 } ] }, " +
           "{ $and: [ { 'user1Id': ?1 }, { 'user2Id': ?0 } ] } " +
           "] }")
    Optional<ChatRoom> findByUsers(String user1Id, String user2Id);
    
    @Query("{ $or: [ { 'user1Id': ?0 }, { 'user2Id': ?0 } ] }")
    List<ChatRoom> findByUserId(String userId);
}
