package com.miniproject.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Report Model
 * Tracks user reports for inappropriate content
 */
@Document(collection = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndexes({
    @CompoundIndex(name = "status_created_idx", def = "{'status': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "reporter_target_idx", def = "{'reporterId': 1, 'targetId': 1}")
})
public class Report {
    
    @Id
    private String id;
    
    private String reporterId; // User who reported
    
    private String targetId; // Thread ID or Comment ID
    
    private String targetType; // "THREAD" or "COMMENT"
    
    private String reason; // Reason for report (spam, harassment, etc.)
    
    private String description; // Optional detailed description
    
    private String status; // "PENDING", "REVIEWED", "RESOLVED", "DISMISSED"
    
    private String reviewedBy; // Moderator who reviewed
    
    private String resolution; // Action taken (deleted, warned, dismissed)
    
    private LocalDateTime createdAt;
    
    private LocalDateTime reviewedAt;
}
