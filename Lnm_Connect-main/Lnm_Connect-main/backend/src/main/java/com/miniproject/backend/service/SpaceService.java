package com.miniproject.backend.service;

import com.miniproject.backend.dto.SpaceDTO;
import com.miniproject.backend.model.Space;
import com.miniproject.backend.repository.SpaceRepository;
import com.miniproject.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing Spaces (Discussion Forums)
 */
@Service
@RequiredArgsConstructor
public class SpaceService {
    
    private final SpaceRepository spaceRepository;
    private final UserRepository userRepository;
    
    /**
     * Create a new space
     */
    @Transactional
    public SpaceDTO createSpace(String userId, String name, String description, List<String> rules, List<String> tags) {
        // Check if space name already exists
        if (spaceRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException("A space with this name already exists");
        }
        
        Space space = new Space();
        space.setName(name);
        space.setDescription(description);
        space.setCreatorId(userId);
        space.setModeratorIds(List.of(userId)); // Creator is automatically a moderator
        space.setMemberIds(new ArrayList<>(List.of(userId))); // Creator is automatically a member
        space.setRules(rules != null ? rules : new ArrayList<>());
        space.setTags(tags != null ? tags : new ArrayList<>());
        space.setThreadCount(0);
        space.setMemberCount(1);
        space.setIsPrivate(false);
        space.setCreatedAt(LocalDateTime.now());
        space.setUpdatedAt(LocalDateTime.now());
        
        Space saved = spaceRepository.save(space);
        return convertToDTO(saved, userId);
    }
    
    /**
     * Get all spaces
     */
    public List<SpaceDTO> getAllSpaces(String currentUserId) {
        List<Space> spaces = spaceRepository.findAll();
        return spaces.stream()
                .map(space -> convertToDTO(space, currentUserId))
                .collect(Collectors.toList());
    }
    
    /**
     * Get space by ID
     */
    public SpaceDTO getSpaceById(String spaceId, String currentUserId) {
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new RuntimeException("Space not found"));
        return convertToDTO(space, currentUserId);
    }
    
    /**
     * Join a space
     */
    @Transactional
    public void joinSpace(String spaceId, String userId) {
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new RuntimeException("Space not found"));
        
        if (!space.getMemberIds().contains(userId)) {
            space.getMemberIds().add(userId);
            space.setMemberCount(space.getMemberCount() + 1);
            space.setUpdatedAt(LocalDateTime.now());
            spaceRepository.save(space);
        }
    }
    
    /**
     * Leave a space
     */
    @Transactional
    public void leaveSpace(String spaceId, String userId) {
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new RuntimeException("Space not found"));
        
        if (space.getMemberIds().contains(userId)) {
            space.getMemberIds().remove(userId);
            space.setMemberCount(Math.max(0, space.getMemberCount() - 1));
            space.setUpdatedAt(LocalDateTime.now());
            spaceRepository.save(space);
        }
    }
    
    /**
     * Get spaces user is a member of
     */
    public List<SpaceDTO> getUserSpaces(String userId) {
        List<Space> spaces = spaceRepository.findByMemberIdsContaining(userId);
        return spaces.stream()
                .map(space -> convertToDTO(space, userId))
                .collect(Collectors.toList());
    }
    
    /**
     * Check if user is moderator of a space
     */
    public boolean isModerator(String spaceId, String userId) {
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new RuntimeException("Space not found"));
        return space.getModeratorIds().contains(userId);
    }
    
    /**
     * Increment thread count
     */
    @Transactional
    public void incrementThreadCount(String spaceId) {
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new RuntimeException("Space not found"));
        space.setThreadCount(space.getThreadCount() + 1);
        spaceRepository.save(space);
    }
    
    /**
     * Decrement thread count
     */
    @Transactional
    public void decrementThreadCount(String spaceId) {
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new RuntimeException("Space not found"));
        space.setThreadCount(Math.max(0, space.getThreadCount() - 1));
        spaceRepository.save(space);
    }
    
    /**
     * Convert Space to DTO
     */
    private SpaceDTO convertToDTO(Space space, String currentUserId) {
        SpaceDTO dto = new SpaceDTO();
        dto.setId(space.getId());
        dto.setName(space.getName());
        dto.setDescription(space.getDescription());
        dto.setIconUrl(space.getIconUrl());
        dto.setCreatorId(space.getCreatorId());
        dto.setModeratorIds(space.getModeratorIds());
        dto.setRules(space.getRules());
        dto.setTags(space.getTags());
        dto.setThreadCount(space.getThreadCount());
        dto.setMemberCount(space.getMemberCount());
        dto.setIsPrivate(space.getIsPrivate());
        dto.setIsMember(space.getMemberIds().contains(currentUserId));
        dto.setIsModerator(space.getModeratorIds().contains(currentUserId));
        dto.setCreatedAt(space.getCreatedAt());
        dto.setUpdatedAt(space.getUpdatedAt());
        
        // Get creator name
        userRepository.findById(space.getCreatorId()).ifPresent(user -> {
            dto.setCreatorName(user.getName());
        });
        
        return dto;
    }
}
