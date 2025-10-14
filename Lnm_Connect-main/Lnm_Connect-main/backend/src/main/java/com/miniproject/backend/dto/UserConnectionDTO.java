package com.miniproject.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserConnectionDTO {
    private String userId;
    private String name;
    private String email;
    private String photoUrl;
    private String education;
    private String branchYear;
    private String bio;
    private List<String> skills;
    private List<String> interests;
    private int mutualConnections;
    private String connectionDate;
    private boolean isFollowing;
    private boolean isFollower;
    private boolean isConnected;
}
