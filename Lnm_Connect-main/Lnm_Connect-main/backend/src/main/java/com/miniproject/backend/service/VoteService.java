package com.miniproject.backend.service;

import com.miniproject.backend.model.Thread;
import com.miniproject.backend.model.ThreadComment;
import com.miniproject.backend.model.Vote;
import com.miniproject.backend.repository.ThreadCommentRepository;
import com.miniproject.backend.repository.ThreadRepository;
import com.miniproject.backend.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for handling votes on threads and comments
 */
@Service
@RequiredArgsConstructor
public class VoteService {
    
    private final VoteRepository voteRepository;
    private final ThreadRepository threadRepository;
    private final ThreadCommentRepository commentRepository;
    
    /**
     * Vote on a thread (upvote = 1, downvote = -1)
     */
    @Transactional
    public Vote voteOnThread(String userId, String threadId, Integer value) {
        if (value != 1 && value != -1) {
            throw new IllegalArgumentException("Vote value must be 1 (upvote) or -1 (downvote)");
        }
        
        Thread thread = threadRepository.findById(threadId)
            .orElseThrow(() -> new RuntimeException("Thread not found"));
        
        // Check if user already voted on this thread
        Optional<Vote> existingVote = voteRepository.findByUserIdAndTargetIdAndTargetType(
            userId, threadId, "THREAD"
        );
        
        Vote vote;
        if (existingVote.isPresent()) {
            vote = existingVote.get();
            
            // Remove old vote counts from thread
            if (vote.getValue() == 1) {
                thread.setUpvotes(thread.getUpvotes() - 1);
            } else {
                thread.setDownvotes(thread.getDownvotes() - 1);
            }
            
            // If same vote, remove it (toggle off)
            if (vote.getValue().equals(value)) {
                voteRepository.delete(vote);
                thread.setVoteScore(thread.getUpvotes() - thread.getDownvotes());
                threadRepository.save(thread);
                return null; // Vote removed
            }
            
            // Change vote
            vote.setValue(value);
            vote.setUpdatedAt(LocalDateTime.now());
        } else {
            // Create new vote
            vote = new Vote();
            vote.setUserId(userId);
            vote.setTargetId(threadId);
            vote.setTargetType("THREAD");
            vote.setValue(value);
            vote.setCreatedAt(LocalDateTime.now());
            vote.setUpdatedAt(LocalDateTime.now());
        }
        
        // Update thread vote counts
        if (value == 1) {
            thread.setUpvotes(thread.getUpvotes() + 1);
        } else {
            thread.setDownvotes(thread.getDownvotes() + 1);
        }
        thread.setVoteScore(thread.getUpvotes() - thread.getDownvotes());
        
        threadRepository.save(thread);
        return voteRepository.save(vote);
    }
    
    /**
     * Vote on a comment (upvote = 1, downvote = -1)
     */
    @Transactional
    public Vote voteOnComment(String userId, String commentId, Integer value) {
        if (value != 1 && value != -1) {
            throw new IllegalArgumentException("Vote value must be 1 (upvote) or -1 (downvote)");
        }
        
        ThreadComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Check if user already voted on this comment
        Optional<Vote> existingVote = voteRepository.findByUserIdAndTargetIdAndTargetType(
            userId, commentId, "COMMENT"
        );
        
        Vote vote;
        if (existingVote.isPresent()) {
            vote = existingVote.get();
            
            // Remove old vote counts from comment
            if (vote.getValue() == 1) {
                comment.setUpvotes(comment.getUpvotes() - 1);
            } else {
                comment.setDownvotes(comment.getDownvotes() - 1);
            }
            
            // If same vote, remove it (toggle off)
            if (vote.getValue().equals(value)) {
                voteRepository.delete(vote);
                comment.setVoteScore(comment.getUpvotes() - comment.getDownvotes());
                commentRepository.save(comment);
                return null; // Vote removed
            }
            
            // Change vote
            vote.setValue(value);
            vote.setUpdatedAt(LocalDateTime.now());
        } else {
            // Create new vote
            vote = new Vote();
            vote.setUserId(userId);
            vote.setTargetId(commentId);
            vote.setTargetType("COMMENT");
            vote.setValue(value);
            vote.setCreatedAt(LocalDateTime.now());
            vote.setUpdatedAt(LocalDateTime.now());
        }
        
        // Update comment vote counts
        if (value == 1) {
            comment.setUpvotes(comment.getUpvotes() + 1);
        } else {
            comment.setDownvotes(comment.getDownvotes() + 1);
        }
        comment.setVoteScore(comment.getUpvotes() - comment.getDownvotes());
        
        commentRepository.save(comment);
        return voteRepository.save(vote);
    }
    
    /**
     * Get user's vote on a specific thread
     */
    public Integer getUserVoteOnThread(String userId, String threadId) {
        Optional<Vote> vote = voteRepository.findByUserIdAndTargetIdAndTargetType(
            userId, threadId, "THREAD"
        );
        return vote.map(Vote::getValue).orElse(0);
    }
    
    /**
     * Get user's vote on a specific comment
     */
    public Integer getUserVoteOnComment(String userId, String commentId) {
        Optional<Vote> vote = voteRepository.findByUserIdAndTargetIdAndTargetType(
            userId, commentId, "COMMENT"
        );
        return vote.map(Vote::getValue).orElse(0);
    }
    
    /**
     * Remove a vote
     */
    @Transactional
    public void removeVote(String userId, String targetId, String targetType) {
        Optional<Vote> vote = voteRepository.findByUserIdAndTargetIdAndTargetType(
            userId, targetId, targetType
        );
        
        if (vote.isPresent()) {
            Vote v = vote.get();
            
            // Update target's vote counts
            if ("THREAD".equals(targetType)) {
                Thread thread = threadRepository.findById(targetId)
                    .orElseThrow(() -> new RuntimeException("Thread not found"));
                
                if (v.getValue() == 1) {
                    thread.setUpvotes(Math.max(0, thread.getUpvotes() - 1));
                } else {
                    thread.setDownvotes(Math.max(0, thread.getDownvotes() - 1));
                }
                thread.setVoteScore(thread.getUpvotes() - thread.getDownvotes());
                threadRepository.save(thread);
                
            } else if ("COMMENT".equals(targetType)) {
                ThreadComment comment = commentRepository.findById(targetId)
                    .orElseThrow(() -> new RuntimeException("Comment not found"));
                
                if (v.getValue() == 1) {
                    comment.setUpvotes(Math.max(0, comment.getUpvotes() - 1));
                } else {
                    comment.setDownvotes(Math.max(0, comment.getDownvotes() - 1));
                }
                comment.setVoteScore(comment.getUpvotes() - comment.getDownvotes());
                commentRepository.save(comment);
            }
            
            voteRepository.delete(v);
        }
    }
}
