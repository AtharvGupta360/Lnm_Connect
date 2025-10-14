package com.miniproject.backend.repository;

import com.miniproject.backend.model.Thread;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for Thread entity
 */
@Repository
public interface ThreadRepository extends MongoRepository<Thread, String> {
    
    /**
     * Find threads by space ID with pagination
     */
    Page<Thread> findBySpaceIdAndIsDeletedFalse(String spaceId, Pageable pageable);
    
    /**
     * Find all threads by space ID ordered by last activity
     */
    List<Thread> findBySpaceIdAndIsDeletedFalseOrderByLastActivityAtDesc(String spaceId);
    
    /**
     * Find threads by author
     */
    List<Thread> findByAuthorIdAndIsDeletedFalseOrderByCreatedAtDesc(String authorId);
    
    /**
     * Find pinned threads in a space
     */
    List<Thread> findBySpaceIdAndIsPinnedTrueAndIsDeletedFalseOrderByCreatedAtDesc(String spaceId);
    
    /**
     * Find threads by tag
     */
    Page<Thread> findBySpaceIdAndTagsContainingAndIsDeletedFalse(String spaceId, String tag, Pageable pageable);
    
    /**
     * Count threads in a space
     */
    long countBySpaceIdAndIsDeletedFalse(String spaceId);
    
    /**
     * Find hot threads (recent activity)
     */
    List<Thread> findBySpaceIdAndIsDeletedFalseAndLastActivityAtAfterOrderByVoteScoreDesc(
        String spaceId, LocalDateTime after, Pageable pageable);
}
