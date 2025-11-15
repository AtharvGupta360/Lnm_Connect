package com.miniproject.backend.repository;

import com.miniproject.backend.model.ThreadComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ThreadComment entity
 */
@Repository
public interface ThreadCommentRepository extends MongoRepository<ThreadComment, String> {
    
    /**
     * Find top-level comments for a thread (parentCommentId is null)
     */
    Page<ThreadComment> findByThreadIdAndParentCommentIdIsNullAndIsDeletedFalse(
        String threadId, Pageable pageable);
    
    /**
     * Find replies to a specific comment
     */
    List<ThreadComment> findByThreadIdAndParentCommentIdAndIsDeletedFalseOrderByCreatedAtAsc(
        String threadId, String parentCommentId);
    
    /**
     * Find all comments for a thread (for counting)
     */
    List<ThreadComment> findByThreadIdAndIsDeletedFalse(String threadId);
    
    /**
     * Count comments in a thread
     */
    long countByThreadIdAndIsDeletedFalse(String threadId);
    
    /**
     * Count replies to a comment
     */
    long countByParentCommentIdAndIsDeletedFalse(String parentCommentId);
    
    /**
     * Find comments by author
     */
    List<ThreadComment> findByAuthorIdAndIsDeletedFalseOrderByCreatedAtDesc(String authorId);
    
    /**
     * Find all comments for a thread ordered by creation date
     */
    List<ThreadComment> findByThreadIdAndIsDeletedOrderByCreatedAtAsc(String threadId, Boolean isDeleted);
}
