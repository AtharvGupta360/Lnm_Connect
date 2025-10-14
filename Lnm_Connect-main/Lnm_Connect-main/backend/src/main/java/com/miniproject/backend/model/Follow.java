package com.miniproject.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "follows")
@CompoundIndex(name = "follower_following_idx", def = "{'followerId': 1, 'followingId': 1}", unique = true)
public class Follow {
    
    @Id
    private String id;
    
    @Indexed
    private String followerId;      // User who initiates follow/connect
    
    @Indexed
    private String followingId;     // User being followed/connected to
    
    private FollowStatus status;    // PENDING, ACCEPTED, REJECTED
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    public enum FollowStatus {
        PENDING,    // Connection request sent, awaiting approval
        ACCEPTED,   // Connection accepted (mutual)
        REJECTED    // Connection request rejected
    }
    
    public Follow(String followerId, String followingId, FollowStatus status) {
        this.followerId = followerId;
        this.followingId = followingId;
        this.status = status;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
