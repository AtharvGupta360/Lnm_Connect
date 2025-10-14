package com.miniproject.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Space (Forum/Community) Model
 * Represents a topic-based discussion space
 */
@Document(collection = "spaces")
@Data
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(name = "space_name_idx", def = "{'name': 1}")
public class Space {
    
    @Id
    private String id;
    
    private String name; // e.g., "AI Research", "Code Help"
    
    private String description;
    
    private String iconUrl; // Optional icon/banner for the space
    
    private String creatorId; // User who created this space
    
    private List<String> moderatorIds = new ArrayList<>(); // List of moderator user IDs
    
    private List<String> memberIds = new ArrayList<>(); // List of joined user IDs
    
    private List<String> rules = new ArrayList<>(); // Community rules
    
    private List<String> tags = new ArrayList<>(); // Suggested tags for this space
    
    private Integer threadCount = 0; // Total number of threads
    
    private Integer memberCount = 0; // Total number of members
    
    private Boolean isPrivate = false; // If true, requires approval to join
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
