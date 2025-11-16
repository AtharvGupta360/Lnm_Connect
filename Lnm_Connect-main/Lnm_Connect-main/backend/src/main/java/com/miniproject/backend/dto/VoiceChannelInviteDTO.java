package com.miniproject.backend.dto;

import com.miniproject.backend.model.VoiceChannelInvite.InviteStatus;
import java.time.LocalDateTime;

public class VoiceChannelInviteDTO {
    private String id;
    private String channelId;
    private String channelName;
    private String inviterId;
    private String inviterName;
    private String inviterPhotoUrl;
    private String inviteeId;
    private String inviteeName;
    private InviteStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getChannelId() { return channelId; }
    public void setChannelId(String channelId) { this.channelId = channelId; }
    public String getChannelName() { return channelName; }
    public void setChannelName(String channelName) { this.channelName = channelName; }
    public String getInviterId() { return inviterId; }
    public void setInviterId(String inviterId) { this.inviterId = inviterId; }
    public String getInviterName() { return inviterName; }
    public void setInviterName(String inviterName) { this.inviterName = inviterName; }
    public String getInviterPhotoUrl() { return inviterPhotoUrl; }
    public void setInviterPhotoUrl(String inviterPhotoUrl) { this.inviterPhotoUrl = inviterPhotoUrl; }
    public String getInviteeId() { return inviteeId; }
    public void setInviteeId(String inviteeId) { this.inviteeId = inviteeId; }
    public String getInviteeName() { return inviteeName; }
    public void setInviteeName(String inviteeName) { this.inviteeName = inviteeName; }
    public InviteStatus getStatus() { return status; }
    public void setStatus(InviteStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
}
