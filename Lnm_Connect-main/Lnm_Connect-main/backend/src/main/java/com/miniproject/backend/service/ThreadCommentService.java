package com.miniproject.backend.service;

import com.miniproject.backend.dto.ThreadCommentDTO;
import com.miniproject.backend.model.Thread;
import com.miniproject.backend.model.ThreadComment;
import com.miniproject.backend.model.User;
import com.miniproject.backend.repository.ThreadCommentRepository;
import com.miniproject.backend.repository.ThreadRepository;
import com.miniproject.backend.repository.UserRepository;
import com.miniproject.backend.event.UserTaggedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for handling thread comments
 */
@Service
@RequiredArgsConstructor
public class ThreadCommentService {
    
    private final ThreadCommentRepository commentRepository;
    private final ThreadRepository threadRepository;
    private final UserRepository userRepository;
    private final VoteService voteService;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;
    
    /**
     * Add a comment to a thread
     */
    @Transactional
    public ThreadCommentDTO addComment(String userId, String threadId, String content, String parentCommentId) {
        // Validate thread exists
        Thread thread = threadRepository.findById(threadId)
            .orElseThrow(() -> new RuntimeException("Thread not found"));
        
        // Validate user exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create comment
        ThreadComment comment = new ThreadComment();
        comment.setThreadId(threadId);
        comment.setAuthorId(userId);
        comment.setContent(content);
        comment.setParentCommentId(parentCommentId);
        comment.setUpvotes(0);
        comment.setDownvotes(0);
        comment.setVoteScore(0);
        comment.setReplyCount(0);
        comment.setIsDeleted(false);
        comment.setIsEdited(false);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        
        // Calculate depth
        if (parentCommentId != null && !parentCommentId.isEmpty()) {
            ThreadComment parentComment = commentRepository.findById(parentCommentId)
                .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setDepth(parentComment.getDepth() + 1);
            
            // Update parent's reply count
            parentComment.setReplyCount(parentComment.getReplyCount() + 1);
            commentRepository.save(parentComment);
        } else {
            comment.setDepth(0);
        }
        
        // Save comment
        ThreadComment savedComment = commentRepository.save(comment);
        
        // Update thread's comment count
        thread.setCommentCount(thread.getCommentCount() + 1);
        threadRepository.save(thread);
        
        // Create notifications
        if (parentCommentId != null && !parentCommentId.isEmpty()) {
            // Reply to a comment - notify parent comment author
            ThreadComment parentComment = commentRepository.findById(parentCommentId).orElse(null);
            if (parentComment != null && !parentComment.getAuthorId().equals(userId)) {
                notificationService.createCommentReplyNotification(
                    parentComment.getAuthorId(),
                    userId,
                    user.getName(),
                    parentCommentId,
                    content,
                    thread.getId()
                );
            }
        } else {
            // Top-level comment - notify thread author
            if (!thread.getAuthorId().equals(userId)) {
                notificationService.createThreadReplyNotification(
                    thread.getAuthorId(),
                    userId,
                    user.getName(),
                    threadId,
                    content
                );
            }
        }
        
        // Extract @mentions and publish events
        Set<String> mentions = notificationService.extractMentions(content);
        for (String mentionedName : mentions) {
            userRepository.findByName(mentionedName).ifPresent(taggedUser -> {
                if (!taggedUser.getId().equals(userId)) {
                    String actionUrl = "/threads/" + threadId;
                    eventPublisher.publishEvent(new UserTaggedEvent(
                        this,
                        taggedUser.getId(),
                        taggedUser.getName(),
                        userId,
                        user.getName(),
                        threadId,
                        "thread",
                        content,
                        actionUrl
                    ));
                }
            });
        }
        
        // Convert to DTO
        return convertToDTO(savedComment, user, 0);
    }
    
    /**
     * Get all comments for a thread (organized by depth)
     */
    public List<ThreadCommentDTO> getCommentsByThread(String threadId, String userId) {
        List<ThreadComment> comments = commentRepository.findByThreadIdAndIsDeletedOrderByCreatedAtAsc(threadId, false);
        
        return comments.stream()
            .map(comment -> {
                User author = userRepository.findById(comment.getAuthorId()).orElse(null);
                Integer userVote = voteService.getUserVoteOnComment(userId, comment.getId());
                return convertToDTO(comment, author, userVote);
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Update a comment (edit)
     */
    @Transactional
    public ThreadCommentDTO updateComment(String commentId, String userId, String content) {
        ThreadComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Check authorization
        if (!comment.getAuthorId().equals(userId)) {
            throw new RuntimeException("You can only edit your own comments");
        }
        
        if (comment.getIsDeleted()) {
            throw new RuntimeException("Cannot edit a deleted comment");
        }
        
        comment.setContent(content);
        comment.setIsEdited(true);
        comment.setUpdatedAt(LocalDateTime.now());
        
        ThreadComment savedComment = commentRepository.save(comment);
        User author = userRepository.findById(userId).orElse(null);
        Integer userVote = voteService.getUserVoteOnComment(userId, commentId);
        
        return convertToDTO(savedComment, author, userVote);
    }
    
    /**
     * Delete a comment (soft delete)
     */
    @Transactional
    public void deleteComment(String commentId, String userId) {
        ThreadComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Check authorization
        if (!comment.getAuthorId().equals(userId)) {
            throw new RuntimeException("You can only delete your own comments");
        }
        
        if (comment.getIsDeleted()) {
            throw new RuntimeException("Comment is already deleted");
        }
        
        // Soft delete
        comment.setIsDeleted(true);
        comment.setContent("[deleted]");
        comment.setUpdatedAt(LocalDateTime.now());
        commentRepository.save(comment);
        
        // Update thread's comment count
        Thread thread = threadRepository.findById(comment.getThreadId())
            .orElseThrow(() -> new RuntimeException("Thread not found"));
        thread.setCommentCount(Math.max(0, thread.getCommentCount() - 1));
        threadRepository.save(thread);
        
        // Update parent's reply count if this is a reply
        if (comment.getParentCommentId() != null && !comment.getParentCommentId().isEmpty()) {
            ThreadComment parentComment = commentRepository.findById(comment.getParentCommentId())
                .orElse(null);
            if (parentComment != null) {
                parentComment.setReplyCount(Math.max(0, parentComment.getReplyCount() - 1));
                commentRepository.save(parentComment);
            }
        }
    }
    
    /**
     * Convert ThreadComment to DTO
     */
    private ThreadCommentDTO convertToDTO(ThreadComment comment, User author, Integer userVote) {
        ThreadCommentDTO dto = new ThreadCommentDTO();
        dto.setId(comment.getId());
        dto.setThreadId(comment.getThreadId());
        dto.setAuthorId(comment.getAuthorId());
        dto.setAuthorName(author != null ? author.getName() : "Unknown");
        dto.setAuthorProfilePic(author != null ? author.getPhotoUrl() : null);
        dto.setParentCommentId(comment.getParentCommentId());
        dto.setContent(comment.getContent());
        dto.setUpvotes(comment.getUpvotes());
        dto.setDownvotes(comment.getDownvotes());
        dto.setVoteScore(comment.getVoteScore());
        dto.setReplyCount(comment.getReplyCount());
        dto.setDepth(comment.getDepth());
        dto.setIsDeleted(comment.getIsDeleted());
        dto.setIsEdited(comment.getIsEdited());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setUserVote(userVote);
        
        return dto;
    }
}
