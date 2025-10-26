package com.miniproject.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class EventRecommendationDTO {
    private String eventId;
    private String title;
    private String description;
    private String organizerName;
    private String organizerType;
    
    private List<String> domainTags;
    private List<String> skillFocus;
    private String activityType;
    
    private LocalDateTime eventDate;
    private String location;
    private String meetingLink;
    
    private Integer maxParticipants;
    private Integer currentParticipants;
    private Integer spotsAvailable;
    
    private String difficulty;
    private String status;
    
    private Double similarityScore;
    private Integer matchPercentage; // 0-100
    
    // Match breakdown
    private List<String> matchingInterests; // Your interests that align with event
    private List<String> relevantSkills; // Your skills relevant to this event
    private List<String> skillsToLearn; // Skills you'll gain from attending
    
    private String matchReason; // e.g., "Aligned with your AI and Python interests"
    private Boolean isUpcoming;
    private Long daysUntilEvent;

    public EventRecommendationDTO() {}

    // Getters and Setters
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getOrganizerName() { return organizerName; }
    public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }
    
    public String getOrganizerType() { return organizerType; }
    public void setOrganizerType(String organizerType) { this.organizerType = organizerType; }
    
    public List<String> getDomainTags() { return domainTags; }
    public void setDomainTags(List<String> domainTags) { this.domainTags = domainTags; }
    
    public List<String> getSkillFocus() { return skillFocus; }
    public void setSkillFocus(List<String> skillFocus) { this.skillFocus = skillFocus; }
    
    public String getActivityType() { return activityType; }
    public void setActivityType(String activityType) { this.activityType = activityType; }
    
    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    
    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }
    
    public Integer getCurrentParticipants() { return currentParticipants; }
    public void setCurrentParticipants(Integer currentParticipants) { this.currentParticipants = currentParticipants; }
    
    public Integer getSpotsAvailable() { return spotsAvailable; }
    public void setSpotsAvailable(Integer spotsAvailable) { this.spotsAvailable = spotsAvailable; }
    
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }
    
    public Integer getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(Integer matchPercentage) { this.matchPercentage = matchPercentage; }
    
    public List<String> getMatchingInterests() { return matchingInterests; }
    public void setMatchingInterests(List<String> matchingInterests) { this.matchingInterests = matchingInterests; }
    
    public List<String> getRelevantSkills() { return relevantSkills; }
    public void setRelevantSkills(List<String> relevantSkills) { this.relevantSkills = relevantSkills; }
    
    public List<String> getSkillsToLearn() { return skillsToLearn; }
    public void setSkillsToLearn(List<String> skillsToLearn) { this.skillsToLearn = skillsToLearn; }
    
    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }
    
    public Boolean getIsUpcoming() { return isUpcoming; }
    public void setIsUpcoming(Boolean isUpcoming) { this.isUpcoming = isUpcoming; }
    
    public Long getDaysUntilEvent() { return daysUntilEvent; }
    public void setDaysUntilEvent(Long daysUntilEvent) { this.daysUntilEvent = daysUntilEvent; }
}
