package com.miniproject.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowStatusDTO {
    private boolean isFollowing;
    private boolean isFollower;
    private boolean isPending;
    private boolean hasPendingRequest;
    private String followId; // ID for outgoing follow (current -> target)
    private String incomingFollowId; // ID for incoming follow (target -> current)
    private String status;
    private long followersCount;
    private long followingCount;
    private int mutualConnections;
}
