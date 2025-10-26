package com.miniproject.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ProjectRecommendationDTO {
    private String projectId;
    private String title;
    private String description;
    private String ownerName;
    
    private List<String> requiredSkills;
    private List<String> tags;
    private String domain;
    private String techStack;
    
    private Integer teamSize;
    private Integer currentTeamMembers;
    private Integer spotsAvailable;
    
    private String status;
    private String difficulty;
    private String mentorName;
    
    private Double similarityScore;
    private Integer matchPercentage; // 0-100
    
    // Match breakdown
    private List<String> matchingSkills; // Skills you have that they need
    private List<String> learningOpportunities; // Skills you can learn
    private Integer skillMatchCount;
    
    private String matchReason; // e.g., "You have 4 out of 5 required skills"
    private LocalDateTime createdAt;

    public ProjectRecommendationDTO() {}

    // Getters and Setters
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    
    public List<String> getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }
    
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    
    public String getTechStack() { return techStack; }
    public void setTechStack(String techStack) { this.techStack = techStack; }
    
    public Integer getTeamSize() { return teamSize; }
    public void setTeamSize(Integer teamSize) { this.teamSize = teamSize; }
    
    public Integer getCurrentTeamMembers() { return currentTeamMembers; }
    public void setCurrentTeamMembers(Integer currentTeamMembers) { this.currentTeamMembers = currentTeamMembers; }
    
    public Integer getSpotsAvailable() { return spotsAvailable; }
    public void setSpotsAvailable(Integer spotsAvailable) { this.spotsAvailable = spotsAvailable; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    
    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }
    
    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }
    
    public Integer getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(Integer matchPercentage) { this.matchPercentage = matchPercentage; }
    
    public List<String> getMatchingSkills() { return matchingSkills; }
    public void setMatchingSkills(List<String> matchingSkills) { this.matchingSkills = matchingSkills; }
    
    public List<String> getLearningOpportunities() { return learningOpportunities; }
    public void setLearningOpportunities(List<String> learningOpportunities) { this.learningOpportunities = learningOpportunities; }
    
    public Integer getSkillMatchCount() { return skillMatchCount; }
    public void setSkillMatchCount(Integer skillMatchCount) { this.skillMatchCount = skillMatchCount; }
    
    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
