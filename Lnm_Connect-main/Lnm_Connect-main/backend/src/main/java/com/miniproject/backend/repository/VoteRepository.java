package com.miniproject.backend.repository;

import com.miniproject.backend.model.Vote;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Vote entity
 */
@Repository
public interface VoteRepository extends MongoRepository<Vote, String> {
    
    /**
     * Find a vote by user, target, and type
     */
    Optional<Vote> findByUserIdAndTargetIdAndTargetType(String userId, String targetId, String targetType);
    
    /**
     * Find all votes by a user
     */
    List<Vote> findByUserId(String userId);
    
    /**
     * Find all votes for a target
     */
    List<Vote> findByTargetIdAndTargetType(String targetId, String targetType);
    
    /**
     * Count upvotes for a target
     */
    long countByTargetIdAndTargetTypeAndValue(String targetId, String targetType, Integer value);
    
    /**
     * Delete all votes for a target (when content is deleted)
     */
    void deleteByTargetIdAndTargetType(String targetId, String targetType);
    
    /**
     * Check if user has voted on target
     */
    boolean existsByUserIdAndTargetIdAndTargetType(String userId, String targetId, String targetType);
}
