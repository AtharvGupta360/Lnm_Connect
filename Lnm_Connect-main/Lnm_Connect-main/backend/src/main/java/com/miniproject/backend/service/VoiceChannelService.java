package com.miniproject.backend.service;

import com.miniproject.backend.dto.VoiceChannelDTO;
import com.miniproject.backend.dto.VoiceChannelInviteDTO;
import com.miniproject.backend.model.Follow;
import com.miniproject.backend.model.User;
import com.miniproject.backend.model.VoiceChannel;
import com.miniproject.backend.model.VoiceChannelInvite;
import com.miniproject.backend.model.VoiceChannelInvite.InviteStatus;
import com.miniproject.backend.repository.FollowRepository;
import com.miniproject.backend.repository.UserRepository;
import com.miniproject.backend.repository.VoiceChannelInviteRepository;
import com.miniproject.backend.repository.VoiceChannelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VoiceChannelService {

    @Autowired
    private VoiceChannelRepository voiceChannelRepository;

    @Autowired
    private VoiceChannelInviteRepository inviteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Create a new voice channel
     */
    @Transactional
    public VoiceChannelDTO createChannel(String creatorId, String channelName) {
        VoiceChannel channel = new VoiceChannel(channelName, creatorId);
        channel = voiceChannelRepository.save(channel);
        return convertToDTO(channel);
    }

    /**
     * Invite users to a voice channel (only connections can be invited)
     */
    @Transactional
    public List<VoiceChannelInviteDTO> inviteUsers(String channelId, String inviterId, List<String> userIds) {
        VoiceChannel channel = voiceChannelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel not found"));

        // Verify inviter is creator or participant
        if (!channel.getCreatorId().equals(inviterId) && !channel.getParticipantIds().contains(inviterId)) {
            throw new RuntimeException("Only participants can invite users");
        }

        List<VoiceChannelInviteDTO> invites = new ArrayList<>();

        for (String userId : userIds) {
            // Check if user is a connection
            if (!areConnected(inviterId, userId)) {
                continue; // Skip non-connections
            }

            // Check if already invited
            Optional<VoiceChannelInvite> existing = inviteRepository
                    .findByChannelIdAndInviteeIdAndStatus(channelId, userId, InviteStatus.PENDING);
            
            if (existing.isPresent()) {
                continue; // Skip already invited users
            }

            // Check if already in channel
            if (channel.getParticipantIds().contains(userId)) {
                continue; // Skip users already in channel
            }

            // Create invite
            VoiceChannelInvite invite = new VoiceChannelInvite(channelId, inviterId, userId);
            invite = inviteRepository.save(invite);

            // Add to invited list
            if (!channel.getInvitedUserIds().contains(userId)) {
                channel.getInvitedUserIds().add(userId);
            }

            // Send notification
            notificationService.createVoiceChannelInviteNotification(inviterId, userId, channelId, channel.getName());

            invites.add(convertInviteToDTO(invite, channel));
        }

        voiceChannelRepository.save(channel);
        return invites;
    }

    /**
     * Accept a voice channel invite
     */
    @Transactional
    public VoiceChannelDTO acceptInvite(String inviteId, String userId) {
        VoiceChannelInvite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() -> new RuntimeException("Invite not found"));

        if (!invite.getInviteeId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (invite.getStatus() != InviteStatus.PENDING) {
            throw new RuntimeException("Invite already processed");
        }

        VoiceChannel channel = voiceChannelRepository.findById(invite.getChannelId())
                .orElseThrow(() -> new RuntimeException("Channel not found"));

        if (!channel.isActive()) {
            throw new RuntimeException("Channel is no longer active");
        }

        if (channel.getParticipantIds().size() >= channel.getMaxParticipants()) {
            throw new RuntimeException("Channel is full");
        }

        // Update invite
        invite.setStatus(InviteStatus.ACCEPTED);
        invite.setRespondedAt(LocalDateTime.now());
        inviteRepository.save(invite);

        // Add user to channel
        if (!channel.getParticipantIds().contains(userId)) {
            channel.getParticipantIds().add(userId);
            voiceChannelRepository.save(channel);
        }

        return convertToDTO(channel);
    }

    /**
     * Reject a voice channel invite
     */
    @Transactional
    public void rejectInvite(String inviteId, String userId) {
        VoiceChannelInvite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() -> new RuntimeException("Invite not found"));

        if (!invite.getInviteeId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        invite.setStatus(InviteStatus.REJECTED);
        invite.setRespondedAt(LocalDateTime.now());
        inviteRepository.save(invite);
    }

    /**
     * Join a voice channel (if invited)
     */
    @Transactional
    public VoiceChannelDTO joinChannel(String channelId, String userId) {
        VoiceChannel channel = voiceChannelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel not found"));

        if (!channel.isActive()) {
            throw new RuntimeException("Channel is no longer active");
        }

        // Check if user is invited or is creator
        if (!channel.getInvitedUserIds().contains(userId) && !channel.getCreatorId().equals(userId)) {
            throw new RuntimeException("User not invited to this channel");
        }

        if (channel.getParticipantIds().size() >= channel.getMaxParticipants()) {
            throw new RuntimeException("Channel is full");
        }

        if (!channel.getParticipantIds().contains(userId)) {
            channel.getParticipantIds().add(userId);
            voiceChannelRepository.save(channel);
        }

        return convertToDTO(channel);
    }

    /**
     * Leave a voice channel
     */
    @Transactional
    public void leaveChannel(String channelId, String userId) {
        VoiceChannel channel = voiceChannelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel not found"));

        channel.getParticipantIds().remove(userId);

        // If creator leaves or no participants left, close the channel
        if (channel.getCreatorId().equals(userId) || channel.getParticipantIds().isEmpty()) {
            channel.setActive(false);
        }

        voiceChannelRepository.save(channel);
    }

    /**
     * Get all pending invites for a user
     */
    public List<VoiceChannelInviteDTO> getPendingInvites(String userId) {
        List<VoiceChannelInvite> invites = inviteRepository.findByInviteeIdAndStatus(userId, InviteStatus.PENDING);
        return invites.stream()
                .map(invite -> {
                    VoiceChannel channel = voiceChannelRepository.findById(invite.getChannelId()).orElse(null);
                    return convertInviteToDTO(invite, channel);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get active channels for a user
     */
    public List<VoiceChannelDTO> getActiveChannels(String userId) {
        List<VoiceChannel> channels = voiceChannelRepository.findByParticipantIdsContaining(userId);
        return channels.stream()
                .filter(VoiceChannel::isActive)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get channel details
     */
    public VoiceChannelDTO getChannel(String channelId) {
        VoiceChannel channel = voiceChannelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel not found"));
        return convertToDTO(channel);
    }

    /**
     * Check if two users are connected
     */
    private boolean areConnected(String userId1, String userId2) {
        Optional<Follow> follow1 = followRepository.findByFollowerIdAndFollowingId(userId1, userId2);
        Optional<Follow> follow2 = followRepository.findByFollowerIdAndFollowingId(userId2, userId1);

        return follow1.isPresent() && follow1.get().getStatus() == Follow.FollowStatus.ACCEPTED &&
               follow2.isPresent() && follow2.get().getStatus() == Follow.FollowStatus.ACCEPTED;
    }

    /**
     * Convert VoiceChannel to DTO
     */
    private VoiceChannelDTO convertToDTO(VoiceChannel channel) {
        VoiceChannelDTO dto = new VoiceChannelDTO();
        dto.setId(channel.getId());
        dto.setName(channel.getName());
        dto.setCreatorId(channel.getCreatorId());
        dto.setInvitedUserIds(channel.getInvitedUserIds());
        dto.setCreatedAt(channel.getCreatedAt());
        dto.setActive(channel.isActive());
        dto.setMaxParticipants(channel.getMaxParticipants());
        dto.setCurrentParticipants(channel.getParticipantIds().size());

        // Get creator info
        userRepository.findById(channel.getCreatorId()).ifPresent(user -> {
            dto.setCreatorName(user.getName());
        });

        // Get participant info
        List<VoiceChannelDTO.ParticipantDTO> participants = new ArrayList<>();
        for (String participantId : channel.getParticipantIds()) {
            userRepository.findById(participantId).ifPresent(user -> {
                participants.add(new VoiceChannelDTO.ParticipantDTO(
                        user.getId(),
                        user.getName(),
                        user.getPhotoUrl()
                ));
            });
        }
        dto.setParticipants(participants);

        return dto;
    }

    /**
     * Convert VoiceChannelInvite to DTO
     */
    private VoiceChannelInviteDTO convertInviteToDTO(VoiceChannelInvite invite, VoiceChannel channel) {
        VoiceChannelInviteDTO dto = new VoiceChannelInviteDTO();
        dto.setId(invite.getId());
        dto.setChannelId(invite.getChannelId());
        dto.setInviterId(invite.getInviterId());
        dto.setInviteeId(invite.getInviteeId());
        dto.setStatus(invite.getStatus());
        dto.setCreatedAt(invite.getCreatedAt());
        dto.setRespondedAt(invite.getRespondedAt());

        if (channel != null) {
            dto.setChannelName(channel.getName());
        }

        // Get inviter info
        userRepository.findById(invite.getInviterId()).ifPresent(user -> {
            dto.setInviterName(user.getName());
            dto.setInviterPhotoUrl(user.getPhotoUrl());
        });

        // Get invitee info
        userRepository.findById(invite.getInviteeId()).ifPresent(user -> {
            dto.setInviteeName(user.getName());
        });

        return dto;
    }

    /**
     * Update audio state for a participant
     */
    @Transactional
    public void updateAudioState(String channelId, String userId, Boolean isMuted, Boolean isDeafened) {
        VoiceChannel channel = voiceChannelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel not found"));

        if (!channel.getParticipantIds().contains(userId)) {
            throw new RuntimeException("User is not in this channel");
        }

        // Audio state is managed on the frontend via WebRTC
        // This endpoint can be used to sync state across devices or for future features
    }
}
