package com.miniproject.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "voice_channels")
public class VoiceChannel {
    @Id
    private String id;
    private String name;
    private String creatorId;
    private List<String> participantIds; // Users currently in the channel
    private List<String> invitedUserIds; // Users invited to the channel
    private LocalDateTime createdAt;
    private boolean isActive;
    private int maxParticipants;

    public VoiceChannel() {
        this.participantIds = new ArrayList<>();
        this.invitedUserIds = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.isActive = true;
        this.maxParticipants = 10;
    }

    public VoiceChannel(String name, String creatorId) {
        this();
        this.name = name;
        this.creatorId = creatorId;
        this.participantIds.add(creatorId); // Creator joins automatically
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(String creatorId) {
        this.creatorId = creatorId;
    }

    public List<String> getParticipantIds() {
        return participantIds;
    }

    public void setParticipantIds(List<String> participantIds) {
        this.participantIds = participantIds;
    }

    public List<String> getInvitedUserIds() {
        return invitedUserIds;
    }

    public void setInvitedUserIds(List<String> invitedUserIds) {
        this.invitedUserIds = invitedUserIds;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public int getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(int maxParticipants) {
        this.maxParticipants = maxParticipants;
    }
}
