package com.miniproject.backend.service;

import com.miniproject.backend.model.UserTag;
import com.miniproject.backend.repository.UserTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for managing user tags/mentions
 */
@Service
@RequiredArgsConstructor
public class UserTagService {
    
    private final UserTagRepository userTagRepository;
    
    /**
     * Create tags for mentioned users
     */
    @Transactional
    public List<UserTag> createTags(String taggerUserId, List<String> taggedUserIds, 
                                    String contentId, String contentType, String content) {
        return taggedUserIds.stream()
                .map(taggedUserId -> {
                    UserTag tag = new UserTag();
                    tag.setTaggedUserId(taggedUserId);
                    tag.setTaggerUserId(taggerUserId);
                    tag.setContentId(contentId);
                    tag.setContentType(contentType);
                    tag.setContent(content);
                    tag.setCreatedAt(LocalDateTime.now());
                    tag.setIsRead(false);
                    return userTagRepository.save(tag);
                })
                .toList();
    }
    
    /**
     * Get all tags for a user
     */
    public List<UserTag> getTagsForUser(String userId) {
        return userTagRepository.findByTaggedUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Get unread tags for a user
     */
    public List<UserTag> getUnreadTagsForUser(String userId) {
        return userTagRepository.findByTaggedUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
    }
    
    /**
     * Mark tags as read
     */
    @Transactional
    public void markTagsAsRead(List<String> tagIds) {
        tagIds.forEach(tagId -> {
            userTagRepository.findById(tagId).ifPresent(tag -> {
                tag.setIsRead(true);
                userTagRepository.save(tag);
            });
        });
    }
    
    /**
     * Get tag count for a user
     */
    public Long getUnreadTagCount(String userId) {
        return userTagRepository.countByTaggedUserIdAndIsRead(userId, false);
    }
    
    /**
     * Delete tags by content
     */
    @Transactional
    public void deleteTagsByContent(String contentId, String contentType) {
        List<UserTag> tags = userTagRepository.findByContentIdAndContentType(contentId, contentType);
        userTagRepository.deleteAll(tags);
    }
}
