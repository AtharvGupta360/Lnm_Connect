package com.miniproject.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowStatusDTO {
    @JsonProperty("isFollowing")
    private boolean isFollowing;
    
    @JsonProperty("isFollower")
    private boolean isFollower;
    
    @JsonProperty("isPending")
    private boolean isPending;
    
    @JsonProperty("hasPendingRequest")
    private boolean hasPendingRequest;
    
    private String followId; // ID for outgoing follow (current -> target)
    private String incomingFollowId; // ID for incoming follow (target -> current)
    private String status;
    private long followersCount;
    private long followingCount;
    private int mutualConnections;
}
