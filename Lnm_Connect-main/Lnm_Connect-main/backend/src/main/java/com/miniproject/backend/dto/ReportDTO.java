package com.miniproject.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for report requests and responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    private String id;
    private String reporterId;
    private String reporterName;
    private String targetId;
    private String targetType; // "THREAD" or "COMMENT"
    private String reason;
    private String description;
    private String status; // "PENDING", "REVIEWED", "RESOLVED", "DISMISSED"
    private String reviewedBy;
    private String resolution;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}
