package com.miniproject.backend.repository;

import com.miniproject.backend.model.Follow;
import com.miniproject.backend.model.Follow.FollowStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends MongoRepository<Follow, String> {
    
    // Find specific follow relationship
    Optional<Follow> findByFollowerIdAndFollowingId(String followerId, String followingId);
    
    // Get all followers of a user (people who follow this user)
    List<Follow> findByFollowingIdAndStatus(String followingId, FollowStatus status);
    
    // Get all users that this user is following
    List<Follow> findByFollowerIdAndStatus(String followerId, FollowStatus status);
    
    // Get pending requests received by a user (ordered by date)
    List<Follow> findByFollowingIdAndStatusOrderByCreatedAtDesc(String followingId, FollowStatus status);
    
    // Get pending requests sent by a user
    List<Follow> findByFollowerIdAndStatusOrderByCreatedAtDesc(String followerId, FollowStatus status);
    
    // Count followers
    long countByFollowingIdAndStatus(String followingId, FollowStatus status);
    
    // Count following
    long countByFollowerIdAndStatus(String followerId, FollowStatus status);
    
    // Check if relationship exists
    boolean existsByFollowerIdAndFollowingId(String followerId, String followingId);
    
    // Delete specific follow relationship
    void deleteByFollowerIdAndFollowingId(String followerId, String followingId);
    
    // Get all follows (for mutual connections calculation)
    List<Follow> findByFollowerIdOrFollowingId(String userId1, String userId2);
}
