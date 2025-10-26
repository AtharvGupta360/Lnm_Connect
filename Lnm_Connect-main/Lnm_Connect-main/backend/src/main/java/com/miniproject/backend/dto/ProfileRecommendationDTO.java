package com.miniproject.backend.dto;

import java.util.List;
import java.util.Map;

public class ProfileRecommendationDTO {
    private String userId;
    private String name;
    private String photoUrl;
    private String bio;
    private String experienceLevel;
    private String branchYear;
    
    private List<String> skills;
    private List<String> interests;
    private List<String> techStack;
    
    private Double similarityScore;
    private Integer matchPercentage; // 0-100
    
    // Match breakdown
    private List<String> commonSkills;
    private List<String> complementarySkills;
    private List<String> commonInterests;
    private Integer collaborationScore; // Based on mutual connections
    
    private String matchReason; // e.g., "Strong match in AI and Python skills"

    public ProfileRecommendationDTO() {}

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
    
    public String getBranchYear() { return branchYear; }
    public void setBranchYear(String branchYear) { this.branchYear = branchYear; }
    
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    
    public List<String> getInterests() { return interests; }
    public void setInterests(List<String> interests) { this.interests = interests; }
    
    public List<String> getTechStack() { return techStack; }
    public void setTechStack(List<String> techStack) { this.techStack = techStack; }
    
    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }
    
    public Integer getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(Integer matchPercentage) { this.matchPercentage = matchPercentage; }
    
    public List<String> getCommonSkills() { return commonSkills; }
    public void setCommonSkills(List<String> commonSkills) { this.commonSkills = commonSkills; }
    
    public List<String> getComplementarySkills() { return complementarySkills; }
    public void setComplementarySkills(List<String> complementarySkills) { this.complementarySkills = complementarySkills; }
    
    public List<String> getCommonInterests() { return commonInterests; }
    public void setCommonInterests(List<String> commonInterests) { this.commonInterests = commonInterests; }
    
    public Integer getCollaborationScore() { return collaborationScore; }
    public void setCollaborationScore(Integer collaborationScore) { this.collaborationScore = collaborationScore; }
    
    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }
}
