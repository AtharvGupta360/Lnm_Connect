package com.miniproject.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "voice_channel_invites")
public class VoiceChannelInvite {
    @Id
    private String id;
    private String channelId;
    private String inviterId;
    private String inviteeId;
    private InviteStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;

    public enum InviteStatus {
        PENDING, ACCEPTED, REJECTED, EXPIRED
    }

    public VoiceChannelInvite() {
        this.status = InviteStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public VoiceChannelInvite(String channelId, String inviterId, String inviteeId) {
        this();
        this.channelId = channelId;
        this.inviterId = inviterId;
        this.inviteeId = inviteeId;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getChannelId() {
        return channelId;
    }

    public void setChannelId(String channelId) {
        this.channelId = channelId;
    }

    public String getInviterId() {
        return inviterId;
    }

    public void setInviterId(String inviterId) {
        this.inviterId = inviterId;
    }

    public String getInviteeId() {
        return inviteeId;
    }

    public void setInviteeId(String inviteeId) {
        this.inviteeId = inviteeId;
    }

    public InviteStatus getStatus() {
        return status;
    }

    public void setStatus(InviteStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(LocalDateTime respondedAt) {
        this.respondedAt = respondedAt;
    }
}
