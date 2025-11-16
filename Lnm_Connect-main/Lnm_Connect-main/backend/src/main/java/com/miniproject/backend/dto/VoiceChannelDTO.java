package com.miniproject.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class VoiceChannelDTO {
    private String id;
    private String name;
    private String creatorId;
    private String creatorName;
    private List<ParticipantDTO> participants;
    private List<String> invitedUserIds;
    private LocalDateTime createdAt;
    private boolean isActive;
    private int maxParticipants;
    private int currentParticipants;

    public static class ParticipantDTO {
        private String userId;
        private String userName;
        private String photoUrl;
        private boolean isMuted;
        private boolean isDeafened;

        public ParticipantDTO() {}

        public ParticipantDTO(String userId, String userName, String photoUrl) {
            this.userId = userId;
            this.userName = userName;
            this.photoUrl = photoUrl;
            this.isMuted = false;
            this.isDeafened = false;
        }

        // Getters and Setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getPhotoUrl() { return photoUrl; }
        public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
        public boolean isMuted() { return isMuted; }
        public void setMuted(boolean muted) { isMuted = muted; }
        public boolean isDeafened() { return isDeafened; }
        public void setDeafened(boolean deafened) { isDeafened = deafened; }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCreatorId() { return creatorId; }
    public void setCreatorId(String creatorId) { this.creatorId = creatorId; }
    public String getCreatorName() { return creatorName; }
    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }
    public List<ParticipantDTO> getParticipants() { return participants; }
    public void setParticipants(List<ParticipantDTO> participants) { this.participants = participants; }
    public List<String> getInvitedUserIds() { return invitedUserIds; }
    public void setInvitedUserIds(List<String> invitedUserIds) { this.invitedUserIds = invitedUserIds; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public int getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(int maxParticipants) { this.maxParticipants = maxParticipants; }
    public int getCurrentParticipants() { return currentParticipants; }
    public void setCurrentParticipants(int currentParticipants) { this.currentParticipants = currentParticipants; }
}
