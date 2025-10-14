package com.miniproject.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowRequestDTO {
    private String requestId;
    private String userId;
    private String userName;
    private String userEmail;
    private String userPhotoUrl;
    private String education;
    private String branchYear;
    private String bio;
    private String status;
    private String createdAt;
    private int mutualConnections;
}
