package com.miniproject.backend.repository;

import com.miniproject.backend.model.VoiceChannelInvite;
import com.miniproject.backend.model.VoiceChannelInvite.InviteStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoiceChannelInviteRepository extends MongoRepository<VoiceChannelInvite, String> {
    List<VoiceChannelInvite> findByInviteeIdAndStatus(String inviteeId, InviteStatus status);
    List<VoiceChannelInvite> findByChannelIdAndStatus(String channelId, InviteStatus status);
    Optional<VoiceChannelInvite> findByChannelIdAndInviteeIdAndStatus(String channelId, String inviteeId, InviteStatus status);
    List<VoiceChannelInvite> findByChannelId(String channelId);
}
