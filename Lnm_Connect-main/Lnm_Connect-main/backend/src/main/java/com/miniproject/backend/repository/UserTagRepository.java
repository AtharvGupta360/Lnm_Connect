package com.miniproject.backend.repository;

import com.miniproject.backend.model.UserTag;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for UserTag
 */
@Repository
public interface UserTagRepository extends MongoRepository<UserTag, String> {
    
    // Find all tags for a specific user
    List<UserTag> findByTaggedUserIdOrderByCreatedAtDesc(String taggedUserId);
    
    // Find all tags created by a user
    List<UserTag> findByTaggerUserIdOrderByCreatedAtDesc(String taggerUserId);
    
    // Find unread tags for a user
    List<UserTag> findByTaggedUserIdAndIsReadOrderByCreatedAtDesc(String taggedUserId, Boolean isRead);
    
    // Find tags by content
    List<UserTag> findByContentIdAndContentType(String contentId, String contentType);
    
    // Count unread tags
    Long countByTaggedUserIdAndIsRead(String taggedUserId, Boolean isRead);
}
