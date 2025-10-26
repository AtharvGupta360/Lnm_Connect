package com.miniproject.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "recommendations")
@CompoundIndex(name = "user_target_idx", def = "{'userId': 1, 'targetType': 1, 'targetId': 1}", unique = true)
public class Recommendation {
    @Id
    private String id;
    
    @Indexed
    private String userId; // User for whom this recommendation is made
    
    @Indexed
    private String targetType; // "profile", "project", "event"
    
    private String targetId; // ID of the recommended profile/project/event
    
    private Double similarityScore; // Overall similarity score (0-1)
    
    // Detailed match breakdown
    private Map<String, Object> matchDetails; // Stores skill_match, interest_overlap, collaboration_affinity, etc.
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Indexed(expireAfterSeconds = 604800) // Recommendations expire after 7 days
    private LocalDateTime expiresAt;

    public Recommendation() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusDays(7);
    }

    public Recommendation(String userId, String targetType, String targetId, Double similarityScore, Map<String, Object> matchDetails) {
        this();
        this.userId = userId;
        this.targetType = targetType;
        this.targetId = targetId;
        this.similarityScore = similarityScore;
        this.matchDetails = matchDetails;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    
    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }
    
    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }
    
    public Map<String, Object> getMatchDetails() { return matchDetails; }
    public void setMatchDetails(Map<String, Object> matchDetails) { this.matchDetails = matchDetails; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
