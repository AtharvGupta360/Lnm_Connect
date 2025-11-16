package com.miniproject.backend.repository;

import com.miniproject.backend.model.VoiceChannel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoiceChannelRepository extends MongoRepository<VoiceChannel, String> {
    List<VoiceChannel> findByCreatorId(String creatorId);
    List<VoiceChannel> findByParticipantIdsContaining(String userId);
    List<VoiceChannel> findByIsActiveTrue();
    Optional<VoiceChannel> findByIdAndIsActiveTrue(String id);
}
