package com.miniproject.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "events")
public class Event {
    @Id
    private String id;
    private String title;
    private String description;
    private String organizerId; // User or club ID
    private String organizerName;
    private String organizerType; // "user", "club"
    
    private List<String> domainTags; // e.g., ["AI", "Web Development", "Networking"]
    private List<String> skillFocus; // Skills participants will learn or use
    private String activityType; // "workshop", "hackathon", "seminar", "competition", "meetup"
    
    private LocalDateTime eventDate;
    private String location; // Physical location or "Online"
    private String meetingLink; // For online events
    
    private Integer maxParticipants;
    private Integer currentParticipants;
    private List<String> registeredUsers; // List of user IDs
    
    private String difficulty; // "beginner", "intermediate", "advanced", "all"
    private Boolean isPublic;
    private String status; // "upcoming", "ongoing", "completed", "cancelled"
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Event() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.currentParticipants = 0;
        this.isPublic = true;
        this.status = "upcoming";
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getOrganizerId() { return organizerId; }
    public void setOrganizerId(String organizerId) { this.organizerId = organizerId; }
    
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
    
    public List<String> getRegisteredUsers() { return registeredUsers; }
    public void setRegisteredUsers(List<String> registeredUsers) { this.registeredUsers = registeredUsers; }
    
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    
    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
