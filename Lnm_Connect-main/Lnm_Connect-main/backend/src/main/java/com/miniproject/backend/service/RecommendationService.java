package com.miniproject.backend.service;

import com.miniproject.backend.dto.EventRecommendationDTO;
import com.miniproject.backend.dto.ProfileRecommendationDTO;
import com.miniproject.backend.dto.ProjectRecommendationDTO;
import com.miniproject.backend.model.*;
import com.miniproject.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {
    
    @Autowired
    private RecommendationRepository recommendationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private RecommendationEngine engine;
    
    private static final int MAX_RECOMMENDATIONS = 20;
    
    /**
     * Generate profile recommendations for a user
     */
    @Transactional
    public List<ProfileRecommendationDTO> generateProfileRecommendations(String userId) {
        Optional<User> currentUserOpt = userRepository.findById(userId);
        if (!currentUserOpt.isPresent()) {
            // Return empty list if user not found instead of throwing exception
            return new ArrayList<>();
        }
        
        User currentUser = currentUserOpt.get();
        
        // Get all other users
        List<User> allUsers = userRepository.findAll();
        
        List<ProfileRecommendationDTO> recommendations = new ArrayList<>();
        
        for (User targetUser : allUsers) {
            // Skip self
            if (targetUser.getId().equals(userId)) {
                continue;
            }
            
            // Calculate similarity
            double similarity = engine.calculateProfileSimilarity(
                currentUser.getSkills(),
                targetUser.getSkills(),
                currentUser.getInterests(),
                targetUser.getInterests(),
                currentUser.getFollowingUsers(),
                targetUser.getFollowingUsers()
            );
            
            // Only include if similarity is above threshold
            if (similarity > 0.1) {
                ProfileRecommendationDTO dto = new ProfileRecommendationDTO();
                dto.setUserId(targetUser.getId());
                dto.setName(targetUser.getName());
                dto.setPhotoUrl(targetUser.getPhotoUrl());
                dto.setBio(targetUser.getBio());
                dto.setExperienceLevel(targetUser.getExperienceLevel());
                dto.setBranchYear(targetUser.getBranchYear());
                dto.setSkills(targetUser.getSkills());
                dto.setInterests(targetUser.getInterests());
                dto.setTechStack(targetUser.getTechStack());
                
                dto.setSimilarityScore(similarity);
                dto.setMatchPercentage((int) (similarity * 100));
                
                // Calculate match details
                List<String> commonSkills = engine.findCommonElements(
                    currentUser.getSkills(), targetUser.getSkills()
                );
                List<String> complementarySkills = engine.findComplementarySkills(
                    currentUser.getSkills(), targetUser.getSkills()
                );
                List<String> commonInterests = engine.findCommonElements(
                    currentUser.getInterests(), targetUser.getInterests()
                );
                
                dto.setCommonSkills(commonSkills);
                dto.setComplementarySkills(complementarySkills);
                dto.setCommonInterests(commonInterests);
                
                // Calculate collaboration score
                int mutualConnections = 0;
                if (currentUser.getFollowingUsers() != null && targetUser.getFollowingUsers() != null) {
                    Set<String> mutual = new HashSet<>(currentUser.getFollowingUsers());
                    mutual.retainAll(targetUser.getFollowingUsers());
                    mutualConnections = mutual.size();
                }
                dto.setCollaborationScore(mutualConnections);
                
                // Generate match reason
                if (!commonSkills.isEmpty()) {
                    dto.setMatchReason(engine.generateMatchReason(commonSkills.size(), "skills"));
                } else if (!commonInterests.isEmpty()) {
                    dto.setMatchReason(engine.generateMatchReason(commonInterests.size(), "interests"));
                } else {
                    dto.setMatchReason("Potential collaboration opportunity");
                }
                
                recommendations.add(dto);
                
                // Save to database
                saveRecommendation(userId, "profile", targetUser.getId(), similarity);
            }
        }
        
        // Sort by similarity score and return top N
        return recommendations.stream()
            .sorted(Comparator.comparingDouble(ProfileRecommendationDTO::getSimilarityScore).reversed())
            .limit(MAX_RECOMMENDATIONS)
            .collect(Collectors.toList());
    }
    
    /**
     * Generate project recommendations for a user
     */
    @Transactional
    public List<ProjectRecommendationDTO> generateProjectRecommendations(String userId) {
        Optional<User> currentUserOpt = userRepository.findById(userId);
        if (!currentUserOpt.isPresent()) {
            // Return empty list if user not found instead of throwing exception
            return new ArrayList<>();
        }
        
        User currentUser = currentUserOpt.get();
        
        // Get recruiting projects
        List<Project> projects = projectRepository.findRecruitingProjects();
        
        List<ProjectRecommendationDTO> recommendations = new ArrayList<>();
        
        for (Project project : projects) {
            // Skip projects user owns or is already member of
            if (project.getOwnerId().equals(userId) ||
                (project.getTeamMembers() != null && project.getTeamMembers().contains(userId))) {
                continue;
            }
            
            // Calculate similarity
            double similarity = engine.calculateProjectSimilarity(
                currentUser.getSkills(),
                project.getRequiredSkills(),
                currentUser.getInterests(),
                project.getTags(),
                project.getCreatedAt()
            );
            
            // Only include if similarity is above threshold
            if (similarity > 0.1) {
                ProjectRecommendationDTO dto = new ProjectRecommendationDTO();
                dto.setProjectId(project.getId());
                dto.setTitle(project.getTitle());
                dto.setDescription(project.getDescription());
                dto.setOwnerName(project.getOwnerName());
                dto.setRequiredSkills(project.getRequiredSkills());
                dto.setTags(project.getTags());
                dto.setDomain(project.getDomain());
                dto.setTechStack(project.getTechStack());
                dto.setTeamSize(project.getTeamSize());
                dto.setCurrentTeamMembers(project.getCurrentTeamMembers());
                dto.setSpotsAvailable(project.getTeamSize() - project.getCurrentTeamMembers());
                dto.setStatus(project.getStatus());
                dto.setDifficulty(project.getDifficulty());
                dto.setMentorName(project.getMentorName());
                dto.setCreatedAt(project.getCreatedAt());
                
                dto.setSimilarityScore(similarity);
                dto.setMatchPercentage((int) (similarity * 100));
                
                // Calculate match details
                List<String> matchingSkills = engine.findCommonElements(
                    currentUser.getSkills(), project.getRequiredSkills()
                );
                List<String> learningOpportunities = engine.findComplementarySkills(
                    currentUser.getSkills(), project.getRequiredSkills()
                );
                
                dto.setMatchingSkills(matchingSkills);
                dto.setLearningOpportunities(learningOpportunities);
                dto.setSkillMatchCount(matchingSkills.size());
                
                // Generate match reason
                int totalSkills = project.getRequiredSkills() != null ? project.getRequiredSkills().size() : 0;
                if (matchingSkills.size() == totalSkills && totalSkills > 0) {
                    dto.setMatchReason("You have all " + totalSkills + " required skills!");
                } else if (matchingSkills.size() > 0) {
                    dto.setMatchReason("You have " + matchingSkills.size() + " out of " + totalSkills + " required skills");
                } else {
                    dto.setMatchReason("Great learning opportunity in " + project.getDomain());
                }
                
                recommendations.add(dto);
                
                // Save to database
                saveRecommendation(userId, "project", project.getId(), similarity);
            }
        }
        
        // Sort by similarity score and return top N
        return recommendations.stream()
            .sorted(Comparator.comparingDouble(ProjectRecommendationDTO::getSimilarityScore).reversed())
            .limit(MAX_RECOMMENDATIONS)
            .collect(Collectors.toList());
    }
    
    /**
     * Generate event recommendations for a user
     */
    @Transactional
    public List<EventRecommendationDTO> generateEventRecommendations(String userId) {
        Optional<User> currentUserOpt = userRepository.findById(userId);
        if (!currentUserOpt.isPresent()) {
            // Return empty list if user not found instead of throwing exception
            return new ArrayList<>();
        }
        
        User currentUser = currentUserOpt.get();
        
        // Get upcoming events
        List<Event> events = eventRepository.findUpcomingEvents(LocalDateTime.now());
        
        List<EventRecommendationDTO> recommendations = new ArrayList<>();
        
        for (Event event : events) {
            // Skip events user is already registered for
            if (event.getRegisteredUsers() != null && event.getRegisteredUsers().contains(userId)) {
                continue;
            }
            
            // Calculate similarity
            double similarity = engine.calculateEventSimilarity(
                currentUser.getSkills(),
                event.getSkillFocus(),
                currentUser.getInterests(),
                event.getDomainTags(),
                event.getEventDate()
            );
            
            // Only include if similarity is above threshold
            if (similarity > 0.1) {
                EventRecommendationDTO dto = new EventRecommendationDTO();
                dto.setEventId(event.getId());
                dto.setTitle(event.getTitle());
                dto.setDescription(event.getDescription());
                dto.setOrganizerName(event.getOrganizerName());
                dto.setOrganizerType(event.getOrganizerType());
                dto.setDomainTags(event.getDomainTags());
                dto.setSkillFocus(event.getSkillFocus());
                dto.setActivityType(event.getActivityType());
                dto.setEventDate(event.getEventDate());
                dto.setLocation(event.getLocation());
                dto.setMeetingLink(event.getMeetingLink());
                dto.setMaxParticipants(event.getMaxParticipants());
                dto.setCurrentParticipants(event.getCurrentParticipants());
                dto.setSpotsAvailable(event.getMaxParticipants() - event.getCurrentParticipants());
                dto.setDifficulty(event.getDifficulty());
                dto.setStatus(event.getStatus());
                
                dto.setSimilarityScore(similarity);
                dto.setMatchPercentage((int) (similarity * 100));
                
                // Calculate match details
                List<String> matchingInterests = engine.findCommonElements(
                    currentUser.getInterests(), event.getDomainTags()
                );
                List<String> relevantSkills = engine.findCommonElements(
                    currentUser.getSkills(), event.getSkillFocus()
                );
                List<String> skillsToLearn = engine.findComplementarySkills(
                    currentUser.getSkills(), event.getSkillFocus()
                );
                
                dto.setMatchingInterests(matchingInterests);
                dto.setRelevantSkills(relevantSkills);
                dto.setSkillsToLearn(skillsToLearn);
                
                // Calculate days until event
                long daysUntilEvent = Duration.between(LocalDateTime.now(), event.getEventDate()).toDays();
                dto.setIsUpcoming(daysUntilEvent >= 0);
                dto.setDaysUntilEvent(daysUntilEvent);
                
                // Generate match reason
                if (!matchingInterests.isEmpty()) {
                    dto.setMatchReason("Aligned with your " + String.join(", ", matchingInterests) + " interests");
                } else if (!skillsToLearn.isEmpty()) {
                    dto.setMatchReason("Learn " + String.join(", ", skillsToLearn));
                } else {
                    dto.setMatchReason("Recommended " + event.getActivityType());
                }
                
                recommendations.add(dto);
                
                // Save to database
                saveRecommendation(userId, "event", event.getId(), similarity);
            }
        }
        
        // Sort by similarity score and return top N
        return recommendations.stream()
            .sorted(Comparator.comparingDouble(EventRecommendationDTO::getSimilarityScore).reversed())
            .limit(MAX_RECOMMENDATIONS)
            .collect(Collectors.toList());
    }
    
    /**
     * Save recommendation to database
     */
    private void saveRecommendation(String userId, String targetType, String targetId, double similarity) {
        // Check if recommendation already exists
        Recommendation existing = recommendationRepository.findByUserIdAndTargetTypeAndTargetId(
            userId, targetType, targetId
        );
        
        if (existing != null) {
            // Update existing
            existing.setSimilarityScore(similarity);
            existing.setUpdatedAt(LocalDateTime.now());
            recommendationRepository.save(existing);
        } else {
            // Create new
            Recommendation recommendation = new Recommendation();
            recommendation.setUserId(userId);
            recommendation.setTargetType(targetType);
            recommendation.setTargetId(targetId);
            recommendation.setSimilarityScore(similarity);
            recommendationRepository.save(recommendation);
        }
    }
    
    /**
     * Refresh all recommendations for a user
     */
    @Transactional
    public void refreshRecommendations(String userId) {
        // Delete old recommendations
        recommendationRepository.deleteByUserId(userId);
        
        // Generate new ones
        generateProfileRecommendations(userId);
        generateProjectRecommendations(userId);
        generateEventRecommendations(userId);
    }
    
    /**
     * Get cached profile recommendations
     */
    public List<ProfileRecommendationDTO> getProfileRecommendations(String userId) {
        List<Recommendation> recommendations = recommendationRepository
            .findByUserIdAndTargetTypeOrderBySimilarityScoreDesc(userId, "profile");
        
        if (recommendations.isEmpty()) {
            // Generate if not exists
            return generateProfileRecommendations(userId);
        }
        
        // Convert to DTOs
        List<ProfileRecommendationDTO> dtos = new ArrayList<>();
        for (Recommendation rec : recommendations) {
            User targetUser = userRepository.findById(rec.getTargetId()).orElse(null);
            if (targetUser != null) {
                ProfileRecommendationDTO dto = new ProfileRecommendationDTO();
                dto.setUserId(targetUser.getId());
                dto.setName(targetUser.getName());
                dto.setPhotoUrl(targetUser.getPhotoUrl());
                dto.setBio(targetUser.getBio());
                dto.setSkills(targetUser.getSkills());
                dto.setInterests(targetUser.getInterests());
                dto.setSimilarityScore(rec.getSimilarityScore());
                dto.setMatchPercentage((int) (rec.getSimilarityScore() * 100));
                dtos.add(dto);
            }
        }
        
        return dtos;
    }
}
