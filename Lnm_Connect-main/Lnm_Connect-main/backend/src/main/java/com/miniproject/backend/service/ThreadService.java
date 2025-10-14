package com.miniproject.backend.service;

import com.miniproject.backend.dto.ThreadDTO;
import com.miniproject.backend.model.Space;
import com.miniproject.backend.model.Thread;
import com.miniproject.backend.model.User;
import com.miniproject.backend.repository.SpaceRepository;
import com.miniproject.backend.repository.ThreadRepository;
import com.miniproject.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Thread/Discussion management
 */
@Service
@RequiredArgsConstructor
public class ThreadService {
    
    private final ThreadRepository threadRepository;
    private final SpaceRepository spaceRepository;
    private final UserRepository userRepository;
    private final SpaceService spaceService;
    
    /**
     * Create a new thread
     */
    @Transactional
    public ThreadDTO createThread(String userId, String spaceId, String title, 
                                   String content, List<String> tags) {
        // Validate user is a member of the space
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new RuntimeException("Space not found"));
        
        if (!space.getMemberIds().contains(userId)) {
            throw new RuntimeException("You must be a member of this space to create threads");
        }
        
        // Create thread
        Thread thread = new Thread();
        thread.setSpaceId(spaceId);
        thread.setAuthorId(userId);
        thread.setTitle(title);
        thread.setContent(content);
        thread.setTags(tags != null ? tags : new ArrayList<>());
        thread.setUpvotes(0);
        thread.setDownvotes(0);
        thread.setVoteScore(0);
        thread.setCommentCount(0);
        thread.setViewCount(0);
        thread.setIsPinned(false);
        thread.setIsLocked(false);
        thread.setIsDeleted(false);
        thread.setCreatedAt(LocalDateTime.now());
        thread.setUpdatedAt(LocalDateTime.now());
        thread.setLastActivityAt(LocalDateTime.now());
        
        Thread saved = threadRepository.save(thread);
        
        // Increment space thread count
        spaceService.incrementThreadCount(spaceId);
        
        return convertToDTO(saved, userId);
    }
    
    /**
     * Get all threads for a space
     */
    public List<ThreadDTO> getThreadsBySpace(String spaceId, String currentUserId) {
        List<Thread> threads = threadRepository.findBySpaceIdAndIsDeletedFalseOrderByLastActivityAtDesc(spaceId);
        return threads.stream()
                .map(thread -> convertToDTO(thread, currentUserId))
                .collect(Collectors.toList());
    }
    
    /**
     * Get thread by ID
     */
    @Transactional
    public ThreadDTO getThreadById(String threadId, String currentUserId) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));
        
        if (thread.getIsDeleted()) {
            throw new RuntimeException("Thread not found");
        }
        
        // Increment view count
        thread.setViewCount(thread.getViewCount() + 1);
        threadRepository.save(thread);
        
        return convertToDTO(thread, currentUserId);
    }
    
    /**
     * Update thread
     */
    @Transactional
    public ThreadDTO updateThread(String threadId, String userId, String title, 
                                   String content, List<String> tags) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));
        
        if (!thread.getAuthorId().equals(userId)) {
            throw new RuntimeException("You can only edit your own threads");
        }
        
        if (thread.getIsDeleted()) {
            throw new RuntimeException("Cannot edit deleted thread");
        }
        
        if (title != null) thread.setTitle(title);
        if (content != null) thread.setContent(content);
        if (tags != null) thread.setTags(tags);
        thread.setUpdatedAt(LocalDateTime.now());
        
        Thread updated = threadRepository.save(thread);
        return convertToDTO(updated, userId);
    }
    
    /**
     * Delete thread (soft delete)
     */
    @Transactional
    public void deleteThread(String threadId, String userId) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));
        
        Space space = spaceRepository.findById(thread.getSpaceId())
                .orElseThrow(() -> new RuntimeException("Space not found"));
        
        // Check if user is author or moderator
        if (!thread.getAuthorId().equals(userId) && !space.getModeratorIds().contains(userId)) {
            throw new RuntimeException("You don't have permission to delete this thread");
        }
        
        thread.setIsDeleted(true);
        thread.setUpdatedAt(LocalDateTime.now());
        threadRepository.save(thread);
        
        // Decrement space thread count
        spaceService.decrementThreadCount(thread.getSpaceId());
    }
    
    /**
     * Pin/Unpin thread (moderator only)
     */
    @Transactional
    public ThreadDTO togglePin(String threadId, String userId) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));
        
        Space space = spaceRepository.findById(thread.getSpaceId())
                .orElseThrow(() -> new RuntimeException("Space not found"));
        
        if (!space.getModeratorIds().contains(userId)) {
            throw new RuntimeException("Only moderators can pin threads");
        }
        
        thread.setIsPinned(!thread.getIsPinned());
        thread.setUpdatedAt(LocalDateTime.now());
        
        Thread updated = threadRepository.save(thread);
        return convertToDTO(updated, userId);
    }
    
    /**
     * Lock/Unlock thread (moderator only)
     */
    @Transactional
    public ThreadDTO toggleLock(String threadId, String userId) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));
        
        Space space = spaceRepository.findById(thread.getSpaceId())
                .orElseThrow(() -> new RuntimeException("Space not found"));
        
        if (!space.getModeratorIds().contains(userId)) {
            throw new RuntimeException("Only moderators can lock threads");
        }
        
        thread.setIsLocked(!thread.getIsLocked());
        thread.setUpdatedAt(LocalDateTime.now());
        
        Thread updated = threadRepository.save(thread);
        return convertToDTO(updated, userId);
    }
    
    /**
     * Convert Thread to DTO
     */
    private ThreadDTO convertToDTO(Thread thread, String currentUserId) {
        ThreadDTO dto = new ThreadDTO();
        dto.setId(thread.getId());
        dto.setSpaceId(thread.getSpaceId());
        dto.setAuthorId(thread.getAuthorId());
        dto.setTitle(thread.getTitle());
        dto.setContent(thread.getContent());
        dto.setTags(thread.getTags());
        dto.setUpvotes(thread.getUpvotes());
        dto.setDownvotes(thread.getDownvotes());
        dto.setVoteScore(thread.getVoteScore());
        dto.setCommentCount(thread.getCommentCount());
        dto.setViewCount(thread.getViewCount());
        dto.setIsPinned(thread.getIsPinned());
        dto.setIsLocked(thread.getIsLocked());
        dto.setCreatedAt(thread.getCreatedAt());
        dto.setUpdatedAt(thread.getUpdatedAt());
        dto.setLastActivityAt(thread.getLastActivityAt());
        
        // Set author name
        userRepository.findById(thread.getAuthorId()).ifPresent(user -> {
            dto.setAuthorName(user.getName());
        });
        
        // Check if current user is the author
        dto.setIsAuthor(thread.getAuthorId().equals(currentUserId));
        
        // TODO: Get user's vote on this thread
        dto.setUserVote(0);
        
        return dto;
    }
}
