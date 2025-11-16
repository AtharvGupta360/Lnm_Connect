package com.miniproject.backend.service;

import com.miniproject.backend.dto.FollowRequestDTO;
import com.miniproject.backend.dto.FollowStatusDTO;
import com.miniproject.backend.dto.UserConnectionDTO;
import com.miniproject.backend.model.Follow;
import com.miniproject.backend.model.Follow.FollowStatus;
import com.miniproject.backend.model.User;
import com.miniproject.backend.repository.FollowRepository;
import com.miniproject.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FollowService {

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;

    /**
     * Send follow/connect request
     */
    @Transactional
    public Follow sendFollowRequest(String followerId, String followingId) {
        // Validation
        if (followerId == null || followingId == null) {
            throw new IllegalArgumentException("User IDs cannot be null");
        }
        
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }

        // Check if relationship already exists
        Optional<Follow> existing = followRepository.findByFollowerIdAndFollowingId(followerId, followingId);
        if (existing.isPresent()) {
            Follow existingFollow = existing.get();
            if (existingFollow.getStatus() == FollowStatus.REJECTED) {
                // Allow resending if previously rejected
                existingFollow.setStatus(FollowStatus.PENDING);
                existingFollow.setUpdatedAt(LocalDateTime.now());
                return followRepository.save(existingFollow);
            }
            throw new IllegalArgumentException("Follow relationship already exists");
        }

        // Note: User validation removed as users may exist in different collections
        // The frontend should ensure valid user IDs before calling this endpoint

        // Create new follow (always PENDING for connection requests)
        Follow follow = new Follow(followerId, followingId, FollowStatus.PENDING);
        Follow savedFollow = followRepository.save(follow);
        
        // Create FOLLOW_REQUEST notification
        userRepository.findById(followerId).ifPresent(follower -> {
            notificationService.createFollowRequestNotification(
                followingId,
                followerId,
                follower.getName()
            );
        });
        
        return savedFollow;
    }

    /**
     * Accept follow/connect request
     */
    @Transactional
    public Follow acceptFollowRequest(String requestId, String userId) {
        Optional<Follow> followOpt = followRepository.findById(requestId);
        if (!followOpt.isPresent()) {
            throw new IllegalArgumentException("Follow request not found");
        }

        Follow follow = followOpt.get();
        
        // Verify the user accepting is the one being followed
        if (!follow.getFollowingId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to accept this request");
        }

        if (follow.getStatus() != FollowStatus.PENDING) {
            throw new IllegalArgumentException("Request is not pending");
        }

        follow.setStatus(FollowStatus.ACCEPTED);
        follow.setUpdatedAt(LocalDateTime.now());
        Follow savedFollow = followRepository.save(follow);
        
        // Create NEW_FOLLOWER notification when request accepted
        userRepository.findById(follow.getFollowerId()).ifPresent(follower -> {
            notificationService.createFollowerNotification(
                follow.getFollowingId(),
                follow.getFollowerId(),
                follower.getName()
            );
        });
        
        return savedFollow;
    }

    /**
     * Reject follow/connect request
     */
    @Transactional
    public void rejectFollowRequest(String requestId, String userId) {
        Optional<Follow> followOpt = followRepository.findById(requestId);
        if (!followOpt.isPresent()) {
            throw new IllegalArgumentException("Follow request not found");
        }

        Follow follow = followOpt.get();
        
        // Verify the user rejecting is the one being followed
        if (!follow.getFollowingId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to reject this request");
        }

        follow.setStatus(FollowStatus.REJECTED);
        follow.setUpdatedAt(LocalDateTime.now());
        followRepository.save(follow);
    }

    /**
     * Unfollow or remove connection
     */
    @Transactional
    public void unfollowUser(String userId, String targetUserId) {
        followRepository.deleteByFollowerIdAndFollowingId(userId, targetUserId);
    }

    /**
     * Get follow status between two users
     */
    public FollowStatusDTO getFollowStatus(String currentUserId, String targetUserId) {
        FollowStatusDTO status = new FollowStatusDTO();

        // Check if current user follows target
        Optional<Follow> following = followRepository.findByFollowerIdAndFollowingId(currentUserId, targetUserId);
        if (following.isPresent()) {
            Follow f = following.get();
            status.setFollowId(f.getId());
            status.setStatus(f.getStatus().toString());
            status.setFollowing(f.getStatus() == FollowStatus.ACCEPTED);
            status.setPending(f.getStatus() == FollowStatus.PENDING);
        }

        // Check if target follows current user (incoming request)
        Optional<Follow> follower = followRepository.findByFollowerIdAndFollowingId(targetUserId, currentUserId);
        if (follower.isPresent()) {
            Follow f = follower.get();
            status.setIncomingFollowId(f.getId()); // Store incoming follow ID
            status.setFollower(f.getStatus() == FollowStatus.ACCEPTED);
            status.setHasPendingRequest(f.getStatus() == FollowStatus.PENDING);
        }

        // Get counts
        status.setFollowersCount(followRepository.countByFollowingIdAndStatus(targetUserId, FollowStatus.ACCEPTED));
        status.setFollowingCount(followRepository.countByFollowerIdAndStatus(targetUserId, FollowStatus.ACCEPTED));
        
        // Calculate mutual connections
        status.setMutualConnections(calculateMutualConnections(currentUserId, targetUserId));

        return status;
    }

    /**
     * Get pending requests received by a user
     */
    public List<FollowRequestDTO> getPendingRequests(String userId) {
        List<Follow> requests = followRepository.findByFollowingIdAndStatusOrderByCreatedAtDesc(userId, FollowStatus.PENDING);
        
        return requests.stream().map(follow -> {
            Optional<User> userOpt = userRepository.findById(follow.getFollowerId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                FollowRequestDTO dto = new FollowRequestDTO();
                dto.setRequestId(follow.getId());
                dto.setUserId(user.getId());
                dto.setUserName(user.getName());
                dto.setUserEmail(user.getEmail());
                dto.setUserPhotoUrl(user.getPhotoUrl());
                dto.setEducation(user.getEducation());
                dto.setBranchYear(user.getBranchYear());
                dto.setBio(user.getBio());
                dto.setStatus(follow.getStatus().toString());
                dto.setCreatedAt(follow.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                dto.setMutualConnections(calculateMutualConnections(userId, user.getId()));
                return dto;
            }
            return null;
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    /**
     * Get list of followers
     */
    public List<UserConnectionDTO> getFollowers(String userId) {
        List<Follow> followers = followRepository.findByFollowingIdAndStatus(userId, FollowStatus.ACCEPTED);
        return convertToUserConnectionDTOs(userId, followers, true);
    }

    /**
     * Get list of following
     */
    public List<UserConnectionDTO> getFollowing(String userId) {
        List<Follow> following = followRepository.findByFollowerIdAndStatus(userId, FollowStatus.ACCEPTED);
        return convertToUserConnectionDTOs(userId, following, false);
    }

    /**
     * Get mutual connections (users who follow each other)
     */
    public List<UserConnectionDTO> getConnections(String userId) {
        List<Follow> following = followRepository.findByFollowerIdAndStatus(userId, FollowStatus.ACCEPTED);
        List<UserConnectionDTO> connections = new ArrayList<>();

        for (Follow follow : following) {
            // Check if they also follow back
            Optional<Follow> reverseFollow = followRepository.findByFollowerIdAndFollowingId(
                follow.getFollowingId(), userId
            );
            
            if (reverseFollow.isPresent() && reverseFollow.get().getStatus() == FollowStatus.ACCEPTED) {
                Optional<User> userOpt = userRepository.findById(follow.getFollowingId());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    UserConnectionDTO dto = createUserConnectionDTO(userId, user, follow);
                    dto.setConnected(true);
                    connections.add(dto);
                }
            }
        }

        return connections;
    }

    /**
     * Calculate mutual connections between two users
     */
    private int calculateMutualConnections(String userId1, String userId2) {
        // Get accepted follows for both users
        List<Follow> user1Following = followRepository.findByFollowerIdAndStatus(userId1, FollowStatus.ACCEPTED);
        List<Follow> user2Following = followRepository.findByFollowerIdAndStatus(userId2, FollowStatus.ACCEPTED);

        // Extract user IDs
        Set<String> user1Connections = user1Following.stream()
            .map(Follow::getFollowingId)
            .collect(Collectors.toSet());
        
        Set<String> user2Connections = user2Following.stream()
            .map(Follow::getFollowingId)
            .collect(Collectors.toSet());

        // Find intersection
        user1Connections.retainAll(user2Connections);
        return user1Connections.size();
    }

    /**
     * Convert Follow list to UserConnectionDTO list
     */
    private List<UserConnectionDTO> convertToUserConnectionDTOs(String currentUserId, List<Follow> follows, boolean isFollowers) {
        return follows.stream().map(follow -> {
            String targetUserId = isFollowers ? follow.getFollowerId() : follow.getFollowingId();
            Optional<User> userOpt = userRepository.findById(targetUserId);
            if (userOpt.isPresent()) {
                return createUserConnectionDTO(currentUserId, userOpt.get(), follow);
            }
            return null;
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    /**
     * Create UserConnectionDTO from User
     */
    private UserConnectionDTO createUserConnectionDTO(String currentUserId, User user, Follow follow) {
        UserConnectionDTO dto = new UserConnectionDTO();
        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhotoUrl(user.getPhotoUrl());
        dto.setEducation(user.getEducation());
        dto.setBranchYear(user.getBranchYear());
        dto.setBio(user.getBio());
        dto.setSkills(user.getSkills());
        dto.setInterests(user.getInterests());
        dto.setConnectionDate(follow.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        dto.setMutualConnections(calculateMutualConnections(currentUserId, user.getId()));

        // Check bidirectional relationship
        Optional<Follow> reverseFollow = followRepository.findByFollowerIdAndFollowingId(user.getId(), currentUserId);
        dto.setFollowing(true);
        dto.setFollower(reverseFollow.isPresent() && reverseFollow.get().getStatus() == FollowStatus.ACCEPTED);
        dto.setConnected(dto.isFollowing() && dto.isFollower());

        return dto;
    }

    /**
     * Get follower and following counts
     */
    public Map<String, Long> getUserCounts(String userId) {
        Map<String, Long> counts = new HashMap<>();
        counts.put("followers", followRepository.countByFollowingIdAndStatus(userId, FollowStatus.ACCEPTED));
        counts.put("following", followRepository.countByFollowerIdAndStatus(userId, FollowStatus.ACCEPTED));
        
        // Count mutual connections
        long mutualCount = getConnections(userId).size();
        counts.put("connections", mutualCount);
        
        return counts;
    }
}
