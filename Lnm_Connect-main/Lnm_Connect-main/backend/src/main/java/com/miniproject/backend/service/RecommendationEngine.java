package com.miniproject.backend.service;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Core ML Engine for generating recommendations
 * Implements content-based filtering with cosine similarity
 */
@Service
public class RecommendationEngine {
    
    // Weighting factors for similarity calculation
    private static final double SKILL_WEIGHT = 0.4;
    private static final double INTEREST_WEIGHT = 0.3;
    private static final double COLLABORATION_WEIGHT = 0.2;
    private static final double ACTIVITY_WEIGHT = 0.1;
    
    /**
     * Calculate cosine similarity between two lists of strings (skills, interests, etc.)
     */
    public double calculateCosineSimilarity(List<String> list1, List<String> list2) {
        if (list1 == null || list2 == null || list1.isEmpty() || list2.isEmpty()) {
            return 0.0;
        }
        
        // Normalize to lowercase for comparison
        Set<String> set1 = list1.stream()
            .map(String::toLowerCase)
            .map(String::trim)
            .collect(Collectors.toSet());
        Set<String> set2 = list2.stream()
            .map(String::toLowerCase)
            .map(String::trim)
            .collect(Collectors.toSet());
        
        // Calculate intersection
        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);
        
        // Calculate union
        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);
        
        if (union.isEmpty()) {
            return 0.0;
        }
        
        // Jaccard similarity (simplified cosine similarity for sets)
        return (double) intersection.size() / union.size();
    }
    
    /**
     * Calculate TF-IDF based similarity for text fields
     */
    public double calculateTextSimilarity(String text1, String text2) {
        if (text1 == null || text2 == null || text1.trim().isEmpty() || text2.trim().isEmpty()) {
            return 0.0;
        }
        
        // Simple word-based similarity
        Set<String> words1 = new HashSet<>(Arrays.asList(text1.toLowerCase().split("\\s+")));
        Set<String> words2 = new HashSet<>(Arrays.asList(text2.toLowerCase().split("\\s+")));
        
        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);
        
        Set<String> union = new HashSet<>(words1);
        union.addAll(words2);
        
        if (union.isEmpty()) {
            return 0.0;
        }
        
        return (double) intersection.size() / union.size();
    }
    
    /**
     * Calculate skill match score between user skills and required skills
     */
    public double calculateSkillMatch(List<String> userSkills, List<String> requiredSkills) {
        return calculateCosineSimilarity(userSkills, requiredSkills);
    }
    
    /**
     * Calculate interest overlap score
     */
    public double calculateInterestOverlap(List<String> interests1, List<String> interests2) {
        return calculateCosineSimilarity(interests1, interests2);
    }
    
    /**
     * Calculate collaboration affinity based on mutual connections
     */
    public double calculateCollaborationAffinity(List<String> userConnections, List<String> targetConnections) {
        if (userConnections == null || targetConnections == null || userConnections.isEmpty() || targetConnections.isEmpty()) {
            return 0.0;
        }
        
        Set<String> mutualConnections = new HashSet<>(userConnections);
        mutualConnections.retainAll(targetConnections);
        
        // Score based on mutual connections
        return Math.min(1.0, mutualConnections.size() / 10.0); // Normalize to 0-1
    }
    
    /**
     * Calculate activity relevance based on recency and engagement
     */
    public double calculateActivityRelevance(java.time.LocalDateTime createdAt) {
        if (createdAt == null) {
            return 0.5; // Default medium relevance
        }
        
        long daysSinceCreation = java.time.Duration.between(createdAt, java.time.LocalDateTime.now()).toDays();
        
        // Recent items get higher scores
        if (daysSinceCreation < 7) {
            return 1.0;
        } else if (daysSinceCreation < 30) {
            return 0.8;
        } else if (daysSinceCreation < 90) {
            return 0.5;
        } else {
            return 0.3;
        }
    }
    
    /**
     * Calculate overall weighted similarity score for profile recommendations
     */
    public double calculateProfileSimilarity(
        List<String> userSkills, List<String> targetSkills,
        List<String> userInterests, List<String> targetInterests,
        List<String> userConnections, List<String> targetConnections
    ) {
        double skillScore = calculateSkillMatch(userSkills, targetSkills);
        double interestScore = calculateInterestOverlap(userInterests, targetInterests);
        double collaborationScore = calculateCollaborationAffinity(userConnections, targetConnections);
        
        // Weighted sum
        return (skillScore * SKILL_WEIGHT) +
               (interestScore * INTEREST_WEIGHT) +
               (collaborationScore * COLLABORATION_WEIGHT) +
               (0.5 * ACTIVITY_WEIGHT); // Default activity score
    }
    
    /**
     * Calculate overall weighted similarity score for project recommendations
     */
    public double calculateProjectSimilarity(
        List<String> userSkills,
        List<String> projectRequiredSkills,
        List<String> userInterests,
        List<String> projectTags,
        java.time.LocalDateTime projectCreatedAt
    ) {
        double skillScore = calculateSkillMatch(userSkills, projectRequiredSkills);
        double interestScore = calculateInterestOverlap(userInterests, projectTags);
        double activityScore = calculateActivityRelevance(projectCreatedAt);
        
        // Weighted sum (higher weight on skill match for projects)
        return (skillScore * 0.5) +
               (interestScore * 0.3) +
               (activityScore * 0.2);
    }
    
    /**
     * Calculate overall weighted similarity score for event recommendations
     */
    public double calculateEventSimilarity(
        List<String> userSkills,
        List<String> eventSkillFocus,
        List<String> userInterests,
        List<String> eventDomainTags,
        java.time.LocalDateTime eventDate
    ) {
        double skillScore = calculateCosineSimilarity(userSkills, eventSkillFocus);
        double interestScore = calculateCosineSimilarity(userInterests, eventDomainTags);
        double activityScore = calculateEventTimingRelevance(eventDate);
        
        // Weighted sum (higher weight on interests for events)
        return (skillScore * 0.3) +
               (interestScore * 0.5) +
               (activityScore * 0.2);
    }
    
    /**
     * Calculate timing relevance for events (upcoming events get higher scores)
     */
    public double calculateEventTimingRelevance(java.time.LocalDateTime eventDate) {
        if (eventDate == null) {
            return 0.5;
        }
        
        long daysUntilEvent = java.time.Duration.between(java.time.LocalDateTime.now(), eventDate).toDays();
        
        // Events happening soon get higher scores
        if (daysUntilEvent < 0) {
            return 0.1; // Past events
        } else if (daysUntilEvent <= 7) {
            return 1.0; // This week
        } else if (daysUntilEvent <= 30) {
            return 0.8; // This month
        } else if (daysUntilEvent <= 90) {
            return 0.6; // Within 3 months
        } else {
            return 0.3; // Far future
        }
    }
    
    /**
     * Find common elements between two lists
     */
    public List<String> findCommonElements(List<String> list1, List<String> list2) {
        if (list1 == null || list2 == null) {
            return new ArrayList<>();
        }
        
        Set<String> set1 = list1.stream()
            .map(String::toLowerCase)
            .map(String::trim)
            .collect(Collectors.toSet());
        Set<String> set2 = list2.stream()
            .map(String::toLowerCase)
            .map(String::trim)
            .collect(Collectors.toSet());
        
        set1.retainAll(set2);
        
        return new ArrayList<>(set1);
    }
    
    /**
     * Find complementary skills (skills in target but not in user)
     */
    public List<String> findComplementarySkills(List<String> userSkills, List<String> targetSkills) {
        if (targetSkills == null) {
            return new ArrayList<>();
        }
        
        Set<String> userSet = userSkills == null ? new HashSet<>() : 
            userSkills.stream()
                .map(String::toLowerCase)
                .map(String::trim)
                .collect(Collectors.toSet());
        
        return targetSkills.stream()
            .filter(skill -> !userSet.contains(skill.toLowerCase().trim()))
            .collect(Collectors.toList());
    }
    
    /**
     * Generate match reason text based on similarity components
     */
    public String generateMatchReason(int commonCount, String category) {
        if (commonCount >= 5) {
            return "Strong match in " + commonCount + " " + category;
        } else if (commonCount >= 3) {
            return "Good match in " + commonCount + " " + category;
        } else if (commonCount >= 1) {
            return "Match in " + commonCount + " " + category;
        } else {
            return "Potential collaboration opportunity";
        }
    }
}
