package com.miniproject.backend.repository;

import com.miniproject.backend.model.Space;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Space entity
 */
@Repository
public interface SpaceRepository extends MongoRepository<Space, String> {
    
    /**
     * Find space by name (case-insensitive)
     */
    Optional<Space> findByNameIgnoreCase(String name);
    
    /**
     * Find all spaces where user is a member
     */
    List<Space> findByMemberIdsContaining(String userId);
    
    /**
     * Find all public spaces
     */
    List<Space> findByIsPrivateFalse();
    
    /**
     * Find spaces by creator
     */
    List<Space> findByCreatorId(String creatorId);
    
    /**
     * Find spaces where user is a moderator
     */
    List<Space> findByModeratorIdsContaining(String userId);
    
    /**
     * Check if space name exists
     */
    boolean existsByNameIgnoreCase(String name);
}
