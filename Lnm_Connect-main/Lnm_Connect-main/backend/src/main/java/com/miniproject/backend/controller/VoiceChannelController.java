package com.miniproject.backend.controller;

import com.miniproject.backend.dto.VoiceChannelDTO;
import com.miniproject.backend.dto.VoiceChannelInviteDTO;
import com.miniproject.backend.service.VoiceChannelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/voice-channels")
@CrossOrigin(origins = "*")
public class VoiceChannelController {

    @Autowired
    private VoiceChannelService voiceChannelService;

    /**
     * Create a new voice channel
     */
    @PostMapping("/create")
    public ResponseEntity<VoiceChannelDTO> createChannel(@RequestBody Map<String, String> request) {
        String creatorId = request.get("creatorId");
        String channelName = request.get("channelName");
        
        VoiceChannelDTO channel = voiceChannelService.createChannel(creatorId, channelName);
        return ResponseEntity.ok(channel);
    }

    /**
     * Invite users to a voice channel
     */
    @PostMapping("/{channelId}/invite")
    public ResponseEntity<List<VoiceChannelInviteDTO>> inviteUsers(
            @PathVariable String channelId,
            @RequestBody Map<String, Object> request) {
        String inviterId = (String) request.get("inviterId");
        @SuppressWarnings("unchecked")
        List<String> userIds = (List<String>) request.get("userIds");
        
        List<VoiceChannelInviteDTO> invites = voiceChannelService.inviteUsers(channelId, inviterId, userIds);
        return ResponseEntity.ok(invites);
    }

    /**
     * Accept a voice channel invite
     */
    @PostMapping("/invites/{inviteId}/accept")
    public ResponseEntity<VoiceChannelDTO> acceptInvite(
            @PathVariable String inviteId,
            @RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        VoiceChannelDTO channel = voiceChannelService.acceptInvite(inviteId, userId);
        return ResponseEntity.ok(channel);
    }

    /**
     * Reject a voice channel invite
     */
    @PostMapping("/invites/{inviteId}/reject")
    public ResponseEntity<Void> rejectInvite(
            @PathVariable String inviteId,
            @RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        voiceChannelService.rejectInvite(inviteId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Join a voice channel
     */
    @PostMapping("/{channelId}/join")
    public ResponseEntity<VoiceChannelDTO> joinChannel(
            @PathVariable String channelId,
            @RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        VoiceChannelDTO channel = voiceChannelService.joinChannel(channelId, userId);
        return ResponseEntity.ok(channel);
    }

    /**
     * Leave a voice channel
     */
    @PostMapping("/{channelId}/leave")
    public ResponseEntity<Void> leaveChannel(
            @PathVariable String channelId,
            @RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        voiceChannelService.leaveChannel(channelId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get pending invites for a user
     */
    @GetMapping("/invites/pending")
    public ResponseEntity<List<VoiceChannelInviteDTO>> getPendingInvites(@RequestParam String userId) {
        List<VoiceChannelInviteDTO> invites = voiceChannelService.getPendingInvites(userId);
        return ResponseEntity.ok(invites);
    }

    /**
     * Get active channels for a user
     */
    @GetMapping("/active")
    public ResponseEntity<List<VoiceChannelDTO>> getActiveChannels(@RequestParam String userId) {
        List<VoiceChannelDTO> channels = voiceChannelService.getActiveChannels(userId);
        return ResponseEntity.ok(channels);
    }

    /**
     * Get channel details
     */
    @GetMapping("/{channelId}")
    public ResponseEntity<VoiceChannelDTO> getChannel(@PathVariable String channelId) {
        VoiceChannelDTO channel = voiceChannelService.getChannel(channelId);
        return ResponseEntity.ok(channel);
    }

    /**
     * Update participant audio state (muted/deafened)
     */
    @PostMapping("/{channelId}/audio-state")
    public ResponseEntity<Void> updateAudioState(
            @PathVariable String channelId,
            @RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        Boolean isMuted = (Boolean) request.get("isMuted");
        Boolean isDeafened = (Boolean) request.get("isDeafened");
        
        voiceChannelService.updateAudioState(channelId, userId, isMuted, isDeafened);
        return ResponseEntity.ok().build();
    }
}
