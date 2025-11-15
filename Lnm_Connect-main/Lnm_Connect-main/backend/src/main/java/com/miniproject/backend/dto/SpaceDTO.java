package com.miniproject.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for Space responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpaceDTO {
    private String id;
    private String name;
    private String description;
    private String iconUrl;
    private String creatorId;
    private String creatorName;
    private List<String> moderatorIds;
    private List<String> memberIds;
    private List<String> rules;
    private List<String> tags;
    private Integer threadCount;
    private Integer memberCount;
    private Boolean isPrivate;
    private Boolean isMember;
    private Boolean isModerator;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
